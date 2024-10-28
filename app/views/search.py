from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q

from app.helpers import is_ajax
from app.models import Projects
from blog.models import BlogPost


def search_view(request):
    """ view to handle search """
    query = request.GET.get('q', '')
    category = request.GET.get('category', 'all')
    sort = request.GET.get('sort', 'relevance')
    page = request.GET.get('page', 1)
    posts_per_page = 6
    projects_per_page = 6
    post_results = BlogPost.objects.none()
    project_results = Projects.objects.none()

    if query:
        if category in ['all', 'posts']:
            post_results = BlogPost.objects.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
        if category in ['all', 'projects']:
            project_results = Projects.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )

        # Apply sorting
        if sort == 'date_desc':
            post_results = post_results.order_by('-created_at')
            project_results = project_results.order_by('-created_at')
        elif sort == 'date_asc':
            post_results = post_results.order_by('created_at')
            project_results = project_results.order_by('created_at')
        elif sort == 'title_asc':
            post_results = post_results.order_by('title')
            project_results = project_results.order_by('title')
        elif sort == 'title_desc':
            post_results = post_results.order_by('-title')
            project_results = project_results.order_by('-title')
        # For 'relevance', we don't need to change the order as it's the default

    # Pagination for posts
    post_paginator = Paginator(post_results, posts_per_page)
    try:
        paginated_posts = post_paginator.page(page)
    except PageNotAnInteger:
        paginated_posts = post_paginator.page(1)
    except EmptyPage:
        paginated_posts = post_paginator.page(post_paginator.num_pages)

    # Pagination for projects
    project_paginator = Paginator(project_results, projects_per_page)
    try:
        paginated_projects = project_paginator.page(page)
    except PageNotAnInteger:
        paginated_projects = project_paginator.page(1)
    except EmptyPage:
        paginated_projects = project_paginator.page(project_paginator.num_pages)

    if is_ajax(request):
        response = {
            'success': True,
            'message': f'Search results: {query}',
            'redirect_url': reverse('search'),
        }
        return JsonResponse(response)
    
    context = {
        'query': query,
        'category': category,
        'sort': sort,
        'posts': paginated_posts,
        'projects': paginated_projects,
        'page_title': 'Search'
    }
    return render(request, 'app/search/search.html', context)