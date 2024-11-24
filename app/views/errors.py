from django.shortcuts import render
from django.http import JsonResponse
from whitenoise.middleware import WhiteNoiseMiddleware
from app.helpers import is_ajax

whitenoise = WhiteNoiseMiddleware()

def error_404_view(request, exception=None):
    """ View to render the 404 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Page not found'}, status=404)
    context = {
        'error_code': '404',
        'error_title': 'Page Not Found',
        'error_message': 'The page you are looking for does not exist or has been moved.',
        'error_image': 'assets/images/errors/404.jpg'
    }
    return render(request, 'errors/http_errors.html', context, status=404)

def error_500_view(request):
    """ View to render the 500 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Server error'}, status=500)
    context = {
        'error_code': '500',
        'error_title': 'Internal Server Error',
        'error_message': 'The server encountered an internal error. Please try again later.',
        'error_image': 'assets/images/errors/500.png'
    }
    return render(request, 'errors/http_errors.html', context, status=500)

def error_403_view(request, exception=None):
    """ View to render the 403 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    context = {
        'error_code': '403',
        'error_title': 'Permission Denied',
        'error_message': 'You do not have permission to access this resource.',
        'error_image': 'assets/images/errors/403.png'
    }
    return render(request, 'errors/http_errors.html', context, status=403)

def error_400_view(request, exception=None):
    """ View to render the 400 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Bad request'}, status=400)
    context = {
        'error_code': '400',
        'error_title': 'Bad Request',
        'error_message': 'The request you made is invalid. Please check and try again.',
        'error_image': 'assets/images/errors/400.png'
    }
    return render(request, 'errors/http_errors.html', context, status=400)
