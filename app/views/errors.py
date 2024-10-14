from django.views.defaults import page_not_found, server_error, permission_denied, bad_request
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
    return page_not_found(request, exception, template_name='app/errors/404.html')


def error_500_view(request, exception=None):
    """ View to render the 500 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Server error'}, status=500)
    return server_error(request, exception, template_name='app/errors/500.html')


def error_403_view(request, exception=None):
    """ View to render the 403 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    return permission_denied(request, exception, template_name='app/errors/403.html')


def error_400_view(request, exception=None):
    """ View to render the 400 page """
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({'error': 'Bad request'}, status=400)
    return bad_request(request, exception, template_name='app/errors/400.html')