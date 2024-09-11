from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q

from app.helpers import is_ajax
from app.models import BlogPost, Projects

def search_view(request):
    """ view to handle search """
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

""" from django.http import JsonResponse
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