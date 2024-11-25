from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q

from app.helpers import is_ajax
from app.models import Projects
from blog.models import BlogPost


def get_filtered_results(query, category):
    """Helper function to get filtered results based on query and category"""
    post_results = BlogPost.objects.none()
    project_results = Projects.objects.none()

    # If no query, show all results
    if not query:
        if category in ['all', 'posts']:
            post_results = BlogPost.objects.all()
        if category in ['all', 'projects']:
            project_results = Projects.objects.all()
        return post_results, project_results

    # If query exists, filter results
    if category in ['all', 'posts']:
        post_results = BlogPost.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        )
    if category in ['all', 'projects']:
        project_results = Projects.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
    return post_results, project_results

def apply_sorting(post_results, project_results, sort):
    """Helper function to sort results"""
    if sort == 'date_desc':
        return post_results.order_by('-created_at'), project_results.order_by('-created_at')
    elif sort == 'date_asc':
        return post_results.order_by('created_at'), project_results.order_by('created_at')
    elif sort == 'title_asc':
        return post_results.order_by('title'), project_results.order_by('title')
    elif sort == 'title_desc':
        return post_results.order_by('-title'), project_results.order_by('-title')
    return post_results, project_results

def paginate_results(queryset, items_per_page, page):
    """Helper function to paginate results"""
    paginator = Paginator(queryset, items_per_page)
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)

def search_view(request):
    """View to handle search"""
    query = request.GET.get('q', '')
    category = request.GET.get('category', 'all')
    sort = request.GET.get('sort', 'relevance')
    page = request.GET.get('page', 1)
    items_per_page = 6

    # Get filtered results
    post_results, project_results = get_filtered_results(query, category)
    
    # Apply sorting
    post_results, project_results = apply_sorting(post_results, project_results, sort)

    # Paginate results
    paginated_posts = paginate_results(post_results, items_per_page, page)
    paginated_projects = paginate_results(project_results, items_per_page, page)

    if is_ajax(request):
        response = {
            'success': True,
            'message': 'Search Results' if not query else f'Search Results: {query}',
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
