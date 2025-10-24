import re
import hashlib
import html
from django.db.models import Q, Count
from django.core.cache import cache
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited

from app.models import Projects
from blog.models import BlogPostPage as BlogPost


class BaseSearchAPIView(APIView):
    """
    Base class for search-related API views with common functionality
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def sanitize_query(self, query):
        """
        Sanitize and validate search query
        """
        if not query or not isinstance(query, str):
            return ""

        # Strip HTML tags and decode HTML entities
        query = html.unescape(query)
        query = re.sub(r'<[^>]+>', '', query)

        # Remove potentially dangerous characters
        query = re.sub(r'[<>"\']', '', query)

        # Limit length
        query = query.strip()[:200]

        # Remove excessive whitespace
        query = re.sub(r'\s+', ' ', query)

        return query.strip()

    def validate_search_params(self, query, category, sort, page, page_size):
        """
        Validate search parameters
        """
        # Validate query
        if not query or len(query.strip()) < 1:
            return False, "Search query is required"

        if len(query) > 200:
            return False, "Search query too long (max 200 characters)"

        # Validate category
        valid_categories = ['all', 'posts', 'projects', 'actions']
        if category not in valid_categories:
            return False, f"Invalid category. Must be one of: {', '.join(valid_categories)}"

        # Validate sort
        valid_sorts = ['relevance', 'date_desc', 'date_asc', 'title_asc', 'title_desc']
        if sort not in valid_sorts:
            return False, f"Invalid sort option. Must be one of: {', '.join(valid_sorts)}"

        # Validate pagination
        if page < 1:
            return False, "Page must be greater than 0"

        if page_size < 1 or page_size > 100:
            return False, "Page size must be between 1 and 100"

        return True, None

    def get_cache_key(self, query, category, sort, page, page_size, user_id=None):
        """
        Generate cache key for search results
        """
        key_data = f"{query}:{category}:{sort}:{page}:{page_size}"
        if user_id:
            key_data += f":{user_id}"

        # Create hash for consistent key length
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"search:{key_hash}"

    def search_blog_posts(self, query, sort, page, page_size):
        """Search and return blog posts with optimized queries"""
        # Use select_related and prefetch_related for better performance
        post_queryset = BlogPost.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query) |
            Q(tags__name__icontains=query)
        ).select_related().prefetch_related('tags').distinct()

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
                'author': {
                    'username': post.author.username if post.author else 'anonymous',
                    'full_name': f"{post.author.first_name} {post.author.last_name}".strip() if post.author else 'Anonymous'
                } if post.author else {'username': 'anonymous', 'full_name': 'Anonymous'},
                'first_image': {
                    'optimized_image_url': post.cover_image_url
                } if post.cover_image_url else None,
                'type': 'blog_post',
                'tags': [tag.name for tag in post.tags.all()],
                'view_count': getattr(post, 'view_count', 0)
            }
            for post in posts_page
        ]

    def search_projects(self, query, sort, page, page_size):
        """Search and return projects with optimized queries"""
        project_queryset = Projects.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query) |
            Q(project_url__icontains=query) | Q(category__icontains=query) |
            Q(project_type__icontains=query) | Q(client__icontains=query)
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

    def search_actions(self, query, user):
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


class SearchAPIView(BaseSearchAPIView):
    """
    Search API that supports projects, blog posts, and authenticated user actions
    with rate limiting, caching, and input validation
    """

    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def _get_search_params(self, request):
        """Extract and validate search parameters from request"""
        query = self.sanitize_query(request.GET.get('q', ''))
        category = request.GET.get('category', 'all')
        sort = request.GET.get('sort', 'relevance')

        try:
            page = max(1, int(request.GET.get('page', 1)))
            page_size = min(100, max(1, int(request.GET.get('page_size', 10))))
        except (ValueError, TypeError):
            page = 1
            page_size = 10

        return query, category, sort, page, page_size

    def _perform_search(self, query, category, sort, page, page_size, user):
        """Perform the actual search across different content types"""
        post_results = []
        project_results = []
        action_results = []

        if category in ['all', 'posts']:
            post_results = self.search_blog_posts(query, sort, page, page_size)
        if category in ['all', 'projects']:
            project_results = self.search_projects(query, sort, page, page_size)
        if user.is_staff and category in ['all', 'actions']:
            action_results = self.search_actions(query, user)

        return post_results, project_results, action_results

    def _build_response(self, query, category, sort, page, page_size, post_results, project_results, action_results):
        """Build the final response data"""
        total_results = len(post_results) + len(project_results) + len(action_results)
        return {
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
            'has_next': (len(post_results) + len(project_results)) >= page_size,
            'has_previous': page > 1
        }

    def _error_response(self, message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
        """Build error response"""
        return Response({
            'success': False,
            'message': message,
            'results': {'posts': [], 'projects': [], 'actions': []},
            'total_results': 0
        }, status=status_code)

    def get(self, request):
        try:
            query, category, sort, page, page_size = self._get_search_params(request)

            is_valid, error_message = self.validate_search_params(query, category, sort, page, page_size)
            if not is_valid:
                return self._error_response(error_message, status.HTTP_400_BAD_REQUEST)

            user_id = request.user.id if request.user.is_authenticated else None
            cache_key = self.get_cache_key(query, category, sort, page, page_size, user_id)
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result)

            post_results, project_results, action_results = self._perform_search(
                query, category, sort, page, page_size, request.user
            )

            response_data = self._build_response(
                query, category, sort, page, page_size,
                post_results, project_results, action_results
            )

            cache.set(cache_key, response_data, 120)
            return Response(response_data)

        except Ratelimited:
            return self._error_response('Rate limit exceeded. Please wait before searching again.', status.HTTP_429_TOO_MANY_REQUESTS)
        except Exception:
            return self._error_response('An error occurred while searching. Please try again.')


class SearchSuggestionsAPIView(BaseSearchAPIView):
    """
    API for search suggestions/autocomplete with rate limiting and caching
    """

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        try:
            query = self.sanitize_query(request.GET.get('q', ''))

            if len(query) < 2:
                return Response({
                    'suggestions': []
                })

            # Check cache first
            cache_key = f"suggestions:{hashlib.md5(query.encode()).hexdigest()}"
            cached_suggestions = cache.get(cache_key)

            if cached_suggestions:
                return Response({
                    'suggestions': cached_suggestions
                })

            suggestions = []

            # Get blog post titles with optimized query
            blog_posts = BlogPost.objects.filter(
                title__icontains=query
            ).values_list('title', flat=True)[:5]

            # Get project titles with optimized query
            projects = Projects.objects.filter(
                title__icontains=query
            ).filter(live=True).values_list('title', flat=True)[:5]

            # Get tags with optimized query
            from taggit.models import Tag
            tags = (
                Tag.objects
                .filter(taggit_taggeditem_items__content_type__model='blogpostpage')
                .annotate(article_count=Count('taggit_taggeditem_items', distinct=True))
                .order_by('name')
                .values_list('name', flat=True)
            )

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

            # Limit total suggestions
            suggestions = suggestions[:10]

            # Cache suggestions for 5 minutes
            cache.set(cache_key, suggestions, 300)

            return Response({
                'suggestions': suggestions
            })

        except Ratelimited:
            return Response({
                'suggestions': []
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        except Exception:
            return Response({
                'suggestions': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PopularSearchesAPIView(BaseSearchAPIView):
    """
    API for popular searches with caching
    """

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        try:
            # Check cache first
            cache_key = 'popular_searches'
            cached_popular = cache.get(cache_key)

            if cached_popular:
                return Response({
                    'popular_searches': cached_popular
                })

            # For now, return some default popular searches
            # In a real implementation, you would track search queries in a database
            popular_searches = [
                {'text': 'React', 'count': 45, 'last_searched': '2024-01-15T10:30:00Z'},
                {'text': 'Django', 'count': 38, 'last_searched': '2024-01-15T09:15:00Z'},
                {'text': 'Python', 'count': 32, 'last_searched': '2024-01-15T08:45:00Z'},
                {'text': 'JavaScript', 'count': 28, 'last_searched': '2024-01-15T07:20:00Z'},
                {'text': 'Web Development', 'count': 25, 'last_searched': '2024-01-15T06:30:00Z'},
                {'text': 'API', 'count': 22, 'last_searched': '2024-01-15T05:45:00Z'},
                {'text': 'Database', 'count': 19, 'last_searched': '2024-01-15T04:15:00Z'},
                {'text': 'Frontend', 'count': 16, 'last_searched': '2024-01-15T03:30:00Z'},
                {'text': 'Backend', 'count': 14, 'last_searched': '2024-01-15T02:45:00Z'},
                {'text': 'Tutorial', 'count': 12, 'last_searched': '2024-01-15T01:20:00Z'},
            ]

            # Cache popular searches for 1 hour
            cache.set(cache_key, popular_searches, 3600)

            return Response({
                'popular_searches': popular_searches
            })

        except Ratelimited:
            return Response({
                'popular_searches': []
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        except Exception:
            return Response({
                'popular_searches': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
