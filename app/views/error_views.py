from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def custom_404(request, exception=None):
    """Custom 404 error page."""
    template = loader.get_template('app/errors/404.html')
    context = {
        'request_path': request.path,
        'exception': exception,
    }
    return HttpResponse(template.render(context, request), status=404)

def custom_500(request):
    """Custom 500 error page."""
    template = loader.get_template('app/errors/500.html')
    context = {
        'request_path': request.path,
    }
    return HttpResponse(template.render(context, request), status=500)

def custom_403(request, exception=None):
    """Custom 403 error page."""
    template = loader.get_template('app/errors/403.html')
    context = {
        'request_path': request.path,
        'exception': exception,
    }
    return HttpResponse(template.render(context, request), status=403)

def custom_400(request, exception=None):
    """Custom 400 error page."""
    template = loader.get_template('app/errors/400.html')
    context = {
        'request_path': request.path,
        'exception': exception,
    }
    return HttpResponse(template.render(context, request), status=400)
