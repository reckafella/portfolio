from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from whitenoise.middleware import WhiteNoiseMiddleware

from app.views.helpers.helpers import is_ajax

whitenoise = WhiteNoiseMiddleware()


def error_400_view(request, exception=None):
    """View to render the 400 page"""
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Bad Request"}, status=400)
    context = {
        "code": "400",
        "title": "Bad Request",
        "message": "The request you made is invalid. Please check and try again.",
        "image": f"{settings.ERROR_CODES['400']}",
    }
    return render(request, "errors/http_errors.html", context, status=400)


def error_403_view(request, exception=None):
    """View to render the 403 page"""
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Permission Denied"}, status=403)
    context = {
        "code": "403",
        "title": "Permission Denied",
        "message": "You do not have permission to access this page / resource.",
        "image": f"{settings.ERROR_CODES['403']}",
    }
    return render(request, "errors/http_errors.html", context, status=403)


def error_404_view(request, exception=None):
    """View to render the 404 page"""
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Not Found"}, status=404)
    context = {
        "code": "404",
        "title": "Not Found",
        "message": "The page or resource you are looking for does not exist or has been moved.",
        "image": f"{settings.ERROR_CODES['404']}",
    }
    return render(request, "errors/http_errors.html", context, status=404)


def error_500_view(request):
    """View to render the 500 page"""
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Server error"}, status=500)
    context = {
        "code": "500",
        "title": "Internal Server Error",
        "message": "The server encountered an internal error. Please try again later.",
        "image": f"{settings.ERROR_CODES['500']}",
    }
    return render(request, "errors/http_errors.html", context, status=500)
