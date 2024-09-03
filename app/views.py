from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse
from django.contrib import messages
from .helpers import is_ajax


def home_view(request):
    ''' View to render the home page '''
    return render(request=request, template_name='app/home.html', status=200)


def about_view(request):
    ''' View to render the home page '''
    return render(request=request, template_name='app/about.html', status=200)


def contact_view(request):
    ''' View to render the home page '''
    return render(request=request, template_name='app/contact.html', status=200)


def blog_view(request):
    ''' View to render the home page '''
    return render(request=request, template_name='app/blog.html', status=200)


def projects_view(request):
    ''' View to render the home page '''

    return render(request=request, template_name='app/projects.html', status=200)
