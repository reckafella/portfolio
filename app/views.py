import os.path

from django.shortcuts import render
import json
from django.conf import settings
"""
from django.http import JsonResponse
from django.urls import reverse
from django.contrib import messages
from .helpers import is_ajax
"""

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
    json_file_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'projects.json')

    with open(json_file_path, 'r') as fl:
        projects_data = json.load(fl)

    context = dict(projects=projects_data)

    return render(request=request, template_name='app/projects.html', context=context, status=200)
