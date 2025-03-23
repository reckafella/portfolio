from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from whitenoise.middleware import WhiteNoiseMiddleware

from app.views.helpers.helpers import is_ajax
from portfolio.middlewares.rate_limit import RateLimitExceeded

whitenoise = WhiteNoiseMiddleware()


def handler_400(request, exception=None):
    """View to render the 400 page"""
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Bad Request"}, status=400)
    context = {
        "code": "400",
        "title": "Bad Request",
        "message": "Invalid request. Please check and try again.",
        "image": settings.ERROR_400,
    }
    return render(request, "errors/http_errors.html", context, status=400)


def handler_429(request, exception=None):
    """ View to handle the 429 page """
    response = whitenoise.process_request(request)

    if is_ajax(request):
        return JsonResponse({
            "error": "Too Many Requests"}, status=429)

    if response:
        return response
    
    context = {
        "code": 429,
        "title": "Too Many Requests",
        "message": "Too Many Requests. Rate Limit Exceeded!",
        "image": settings.ERROR_403
    }
    return render(request, "errors/http_errors.html", context, status=429)


def handler_403(request, exception=None):
    """View to render the 403 page"""
    response = whitenoise.process_request(request)

    if is_ajax(request):
        return JsonResponse({
            "error": "Permission Denied"}, status=403)

    if response:
        return response
    context = {
        "code": "403",
        "title": "Permission Denied",
        "message": "You do not have permission to access this page / resource.",
        "image": settings.ERROR_403,
    }
    return render(request, "errors/http_errors.html", context, status=403)


def handler_404(request, exception=None):
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
        "image": settings.ERROR_404,
    }
    return render(request, "errors/http_errors.html", context, status=404)


def handler_500(request, exception=None):
    """View to render the 500 page"""
    if isinstance(exception, RateLimitExceeded):
        return handler_429(request, exception)
    response = whitenoise.process_request(request)
    if response:
        return response
    if is_ajax(request):
        return JsonResponse({"error": "Server error"}, status=500)
    context = {
        "code": "500",
        "title": "Internal Server Error",
        "message": f"Internal Server error '{exception}'.\n Please try again later.",
        "image":  settings.ERROR_500,
    }
    return render(request, "errors/http_errors.html", context, status=500)
