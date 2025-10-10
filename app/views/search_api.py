from django.db.models import Q, Count
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status

from app.models import Projects
from blog.models import BlogPostImage, BlogPostPage as BlogPost
from authentication.models import User


def _search_blog_posts(query, sort, page, page_size):
    """Search and return blog posts"""
    post_queryset = BlogPost.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(tags__name__icontains=query)
    ).distinct()

    # Apply sorting
    if sort == 'date_desc':
        post_queryset = post_queryset.order_by('-first_published_at')
    elif sort == 'date_asc':
        post_queryset = post_queryset.order_by('first_published_at')
    elif sort == 'title_asc':
        post_queryset = post_queryset.order_by('title')
    elif sort == 'title_desc':
        post_queryset = post_queryset.order_by('-title')

    # Paginate and serialize
    start = (page - 1) * page_size
    end = start + page_size
    posts_page = post_queryset[start:end]

    return [
        {
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'content': post.content[:200] + '...' if len(post.content) > 200 else post.content,
            'first_published_at': post.first_published_at.isoformat() if post.first_published_at else None,
            'url': f'/blog/article/{post.slug}',
            'type': 'blog_post',
            'tags': [tag.name for tag in post.tags.all()],
            'view_count': getattr(post, 'view_count', 0)
        }
        for post in posts_page
    ]


def _search_projects(query, sort, page, page_size):
    """Search and return projects"""
    project_queryset = Projects.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(project_url__icontains=query) |
        Q(category__icontains=query) |
        Q(project_type__icontains=query) |
        Q(client__icontains=query)
    ).filter(live=True)

    # Apply sorting
    if sort == 'date_desc':
        project_queryset = project_queryset.order_by('-created_at')
    elif sort == 'date_asc':
        project_queryset = project_queryset.order_by('created_at')
    elif sort == 'title_asc':
        project_queryset = project_queryset.order_by('title')
    elif sort == 'title_desc':
        project_queryset = project_queryset.order_by('-title')

    # Paginate and serialize
    start = (page - 1) * page_size
    end = start + page_size
    projects_page = project_queryset[start:end]

    return [
        {
            'id': project.id,
            'title': project.title,
            'slug': project.slug,
            'description': project.description[:200] + '...' if len(project.description) > 200 else project.description,
            'created_at': project.created_at.isoformat(),
            'url': f'/projects/{project.slug}',
            'type': 'project',
            'category': project.category,
            'project_type': project.project_type,
            'client': project.client,
            'project_url': project.project_url
        }
        for project in projects_page
    ]


def _search_actions(query, user):
    """Search and return user actions"""
    if not user.is_authenticated:
        return []

    action_results = []

    # Check for create/edit actions
    if any(keyword in query.lower() for keyword in ['create', 'add', 'new', 'write', 'edit', 'update']):
        if user.is_staff:
            action_results.extend([
                {
                    'id': 'create_blog',
                    'title': 'Create Blog Post',
                    'description': 'Create a new blog post',
                    'url': '/blog/create',
                    'type': 'action',
                    'action_type': 'create',
                    'icon': 'bi-file-earmark-text'
                },
                {
                    'id': 'create_project',
                    'title': 'Create Project',
                    'description': 'Add a new project to your portfolio',
                    'url': '/projects/create',
                    'type': 'action',
                    'action_type': 'create',
                    'icon': 'bi-folder-plus'
                }
            ])

        # Check for specific content creation
        if 'blog' in query.lower() or 'post' in query.lower():
            action_results.append({
                'id': 'create_blog_specific',
                'title': 'Create Blog Post',
                'description': 'Write and publish a new blog post',
                'url': '/blog/create',
                'type': 'action',
                'action_type': 'create',
                'icon': 'bi-file-earmark-text'
            })

        if 'project' in query.lower():
            action_results.append({
                'id': 'create_project_specific',
                'title': 'Create Project',
                'description': 'Add a new project to your portfolio',
                'url': '/projects/create',
                'type': 'action',
                'action_type': 'create',
                'icon': 'bi-folder-plus'
            })

    # Check for dashboard/admin actions
    if any(keyword in query.lower() for keyword in ['dashboard', 'admin', 'manage', 'settings']):
        if user.is_staff:
            action_results.extend([
                {
                    'id': 'admin_dashboard',
                    'title': 'Admin Dashboard',
                    'description': 'Access the admin dashboard',
                    'url': '/admin/',
                    'type': 'action',
                    'action_type': 'admin',
                    'icon': 'bi-gear'
                },
                {
                    'id': 'manage_posts',
                    'title': 'Manage Blog Posts',
                    'description': 'View and edit all blog posts',
                    'url': '/blog/manage',
                    'type': 'action',
                    'action_type': 'manage',
                    'icon': 'bi-journal-text'
                },
                {
                    'id': 'manage_projects',
                    'title': 'Manage Projects',
                    'description': 'View and edit all projects',
                    'url': '/projects/manage',
                    'type': 'action',
                    'action_type': 'manage',
                    'icon': 'bi-folder'
                }
            ])

    return action_results


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def search_api(request):
    """
    Enhanced search API that supports projects, blog posts, and authenticated user actions
    """
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', 'all')
    sort = request.GET.get('sort', 'relevance')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))

    if not query:
        return Response({
            'success': False,
            'message': 'Search query is required',
            'results': {
                'posts': [],
                'projects': [],
                'actions': []
            },
            'total_results': 0
        }, status=status.HTTP_400_BAD_REQUEST)

    # Initialize results
    post_results = []
    project_results = []
    action_results = []

    # Search in blog posts
    if category in ['all', 'posts']:
        post_results = _search_blog_posts(query, sort, page, page_size)

    # Search in projects
    if category in ['all', 'projects']:
        project_results = _search_projects(query, sort, page, page_size)

    # Search for authenticated user actions
    if request.user.is_authenticated and category in ['all', 'actions']:
        action_results = _search_actions(query, request.user)

    # Calculate total results
    total_results = len(post_results) + len(project_results) + len(action_results)

    return Response({
        'success': True,
        'query': query,
        'category': category,
        'sort': sort,
        'page': page,
        'page_size': page_size,
        'results': {
            'posts': post_results,
            'projects': project_results,
            'actions': action_results
        },
        'total_results': total_results,
        'has_next': (len(post_results) + len(project_results)) >= page_size,  # Only count content results for pagination
        'has_previous': page > 1
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def search_suggestions_api(request):
    """
    API for search suggestions/autocomplete
    """
    query = request.GET.get('q', '').strip()

    if len(query) < 2:
        return Response({
            'suggestions': []
        })

    suggestions = []

    # Get blog post titles
    blog_posts = BlogPost.objects.filter(
        title__icontains=query
    ).values_list('title', flat=True)[:5]

    # Get project titles
    projects = Projects.objects.filter(
        title__icontains=query
    ).values_list('title', flat=True)[:5]

    # Get tags
    from taggit.models import Tag
    tags = (
        Tag.objects
        .filter(taggit_taggeditem_items__content_type__model='blogpostpage').annotate(article_count=Count(
            'taggit_taggeditem_items', distinct=True)
                                    ).order_by('name')
                                    ).values_list('name', flat=True)

    # Combine and format suggestions
    for title in blog_posts:
        suggestions.append({
            'text': title,
            'type': 'blog_post',
            'category': 'posts'
        })

    for title in projects:
        suggestions.append({
            'text': title,
            'type': 'project',
            'category': 'projects'
        })

    for tag in tags:
        suggestions.append({
            'text': tag,
            'type': 'tag',
            'category': 'posts'
        })

    return Response({
        'suggestions': suggestions[:10]  # Limit total suggestions
    })
