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
            )
        if category in ['all', 'projects']:
            project_results = Projects.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )

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


""" def search_view(request):
    '''view to handle search '''
    query = request.GET.get('q', '')
    category = request.GET.get('category', 'all')

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
        'posts': post_results,
        'projects': project_results,
        'page_title': 'Search'
    }

    return render(request, 'app/search.html', context)
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from app.helpers import is_ajax
from app.models import BlogPost, Projects


def search_view(request):
    ''' view to handle search '''
    if request.method == 'POST':
        query = request.POST.get('q')
    elif request.method == 'GET':
        query = request.GET.get('q')
    if query:
        post_results = BlogPost.objects.filter(title__icontains=query) | BlogPost.objects.filter(content__icontains=query)
        project_results = Projects.objects.filter(title__icontains=query) | Projects.objects.filter(description__icontains=query)
    else:
        post_results = BlogPost.objects.all()
        project_results = Projects.objects.all()

    if is_ajax(request):
        response = {
            'success': True,
            'message': f'Search results: {query}',
            'redirect_url': reverse('search'),
        }
        return JsonResponse(response)
    
    context = {
        'query': query,
        'posts': post_results,
        'projects': project_results,
        'page_title': 'Search'
    }

    return render(request, 'app/search.html', context)
 """