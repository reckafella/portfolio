from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from app.helpers import is_ajax
from app.models import BlogPost


def search_view(request):
    """ view to handle search """
    if request.method == 'POST':
        query = request.POST.get('q')
    elif request.method == 'GET':
        query = request.GET.get('q')
    if query:
        results = BlogPost.objects.filter(title__icontains=query) | BlogPost.objects.filter(content__icontains=query)
    else:
        results = BlogPost.objects.all()

    if is_ajax(request):
        response = {
            'success': True,
            'message': 'Search results',
            'redirect_url': reverse('search'),
        }
        return JsonResponse(response)
    
    context = {
        'query': query,
        'results': results
    }
    return render(request, 'app/search.html', context)
