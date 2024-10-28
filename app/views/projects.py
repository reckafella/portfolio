import os.path
from titlecase import titlecase
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse
from django.shortcuts import redirect, render
import json
from ..helpers import is_ajax
from django.conf import settings
from django.urls import reverse

from app.forms import ProjectsForm
from app.models import Projects


@login_required
def add_project_view(request):
    if not request.user.is_staff:
        if is_ajax(request):
            return JsonResponse({
                'success': False,
                'message': 'You are not authorized to add a project'
                })
        return redirect('home')
    
    if request.method == 'POST':
        form = ProjectsForm(request.POST, request.FILES)
        if form.is_valid():
            title = titlecase(form.cleaned_data.get('title'))
            description = titlecase(form.cleaned_data.get('description'))
            image = form.cleaned_data.get('image')
            link = form.cleaned_data.get('link')

            try:
                Projects.objects.create(
                    title=title,
                    description=description,
                    image=image,
                    link=link
                )
            except Exception as e:
                if is_ajax(request):
                    return JsonResponse({
                        'success': False,
                        'message': f'An error occurred while adding project: {str(e)}'
                    })

            if is_ajax(request):
                response = {
                    'success': True,
                    'message': 'Project added successfully',
                    'redirect_url': reverse('projects')
                }
                return JsonResponse(response)

            return redirect('projects')
        else:
            if is_ajax(request):
                return JsonResponse({
                    'success': False,
                    'errors': form.errors})
    else:
        form = ProjectsForm()

    context = {
        'form': form,
        'page_title': 'Add a New Project',
        'form_title': 'Add Project',
        'submit_text': 'Add Project'
    }
    return render(request, 'app/projects/add_project.html', context)


def projects_view(request):
    """ View to render the projects page """
    # first check if the db is empty
    projects = Projects.objects.all()

    if not projects.exists():
        # if db is empty, load data from json file
        json_file_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'projects.json')

        with open(json_file_path, 'r') as fl:
            projects_data = json.load(fl)

    else:
        # if db is not empty, load data from db
        projects_data = projects.values('title', 'description', 'image', 'url')
    
    paginator = Paginator(projects_data, 6)  # Show 6 projects per page
    page = request.GET.get('page')

    try:
        projects_data = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        projects_data = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        projects_data = paginator.page(paginator.num_pages)

    context = dict(projects=projects_data, page_title='Projects')

    return render(request=request, template_name='app/projects/projects.html', context=context, status=200)