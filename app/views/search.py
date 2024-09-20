from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q
from app.helpers import is_ajax
from app.models import BlogPost, Projects

def search_view(request):
    """ view to handle search """
    query = request.GET.get('q', '')
    category = request.GET.get('category', 'all')
    page = request.GET.get('page', 1)
    posts_per_page = 6  # You can adjust this number
    projects_per_page = 6  # You can adjust this number
    post_results = BlogPost.objects.none()
    project_results = Projects.objects.none()

    if query:
        if category in ['all', 'posts']:
            post_results = BlogPost.objects.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            ).order_by('-created_at')  # Add ordering here

        if category in ['all', 'projects']:
            project_results = Projects.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            ).order_by('-created_at')  # Add ordering here

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
        'posts': paginated_posts,
        'projects': paginated_projects,
        'page_title': 'Search'
    }
    return render(request, 'app/search.html', context)
