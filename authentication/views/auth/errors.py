from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

from app.views.helpers.helpers import is_ajax
from portfolio.middlewares.rate_limit import RateLimitExceeded


def handler_400(request, exception=None):
    """View to render the 400 page"""
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
    if is_ajax(request):
        return JsonResponse({
            "error": "Too Many Requests"}, status=429)

    context = {
        "code": 429,
        "title": "Too Many Requests",
        "message": "Too Many Requests. Rate Limit Exceeded!",
        "image": settings.ERROR_403
    }
    return render(request, "errors/http_errors.html", context, status=429)


def handler_403(request, exception=None):
    """View to render the 403 page"""
    if is_ajax(request):
        return JsonResponse({
            "error": "Permission Denied"}, status=403)

    context = {
        "code": "403",
        "title": "Permission Denied",
        "message": f"You do not have permission to access {request.path}.",
        "image": settings.ERROR_403,
    }
    return render(request, "errors/http_errors.html", context, status=403)


def handler_404(request, exception=None):
    """View to render the 404 page"""
    request_path = request.path
    if is_ajax(request):
        return JsonResponse({"error": "Not Found"}, status=404)
    context = {
        "code": "404",
        "title": "Not Found",
        "message": f"The requested path `{request_path}` not found.",
        "image": settings.ERROR_404,
    }
    return render(request, "errors/http_errors.html", context, status=404)


def handler_500(request, exception=None):
    """View to render the 500 page"""
    if isinstance(exception, RateLimitExceeded):
        return handler_429(request, exception)

    if is_ajax(request):
        return JsonResponse({"error": "Server error"}, status=500)

    context = {
        "code": "500",
        "title": "Internal Server Error",
        "message": f"Internal Server error {exception}.\n Try again later.",
        "image":  settings.ERROR_500,
    }
    return render(request, "errors/http_errors.html", context, status=500)
