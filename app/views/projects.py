from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import CreateView, ListView
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.core.exceptions import PermissionDenied
from titlecase import titlecase
import json
import os

from django.conf import settings
from app.forms import ProjectsForm
from app.models import Projects

class ProjectCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Projects
    form_class = ProjectsForm
    template_name = 'app/projects/add_project.html'
    success_url = reverse_lazy('projects')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'page_title': 'Add a New Project',
            'form_title': 'Add Project',
            'submit_text': 'Add Project'
        })
        return context

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'You are not authorized to add a project'
            }, status=403)
        raise PermissionDenied('You are not authorized to add a project')

    def form_valid(self, form):
        form.instance.title = titlecase(form.cleaned_data.get('title'))
        form.instance.description = titlecase(form.cleaned_data.get('description'))
        
        try:
            response = super().form_valid(form)
            
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Project added successfully',
                    'redirect_url': self.success_url
                })
            
            return response
        
        except Exception as e:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': f'An error occurred while adding project: {str(e)}'
                }, status=500)
            raise

    def form_invalid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
        return super().form_invalid(form)

class ProjectListView(ListView):
    model = Projects
    template_name = 'app/projects/projects.html'
    context_object_name = 'projects'
    paginate_by = 6

    def get_queryset(self):
        projects = Projects.objects.all()

        # Load data from JSON if database is empty
        if not projects.exists():
            json_file_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'projects.json')
            
            with open(json_file_path, 'r') as fl:
                projects_data = json.load(fl)

            for project in projects_data:
                Projects.objects.create(
                    title=project['title'],
                    description=project['description'],
                    image=project['image'],
                    url=project['url']
                )
            
            projects = Projects.objects.all()

        return projects

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Projects'
        return context
