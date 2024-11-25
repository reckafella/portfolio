from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import CreateView, ListView
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.core.exceptions import PermissionDenied
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.views import redirect_to_login
from titlecase import titlecase
from django.conf import settings
import json, os

from app.forms import ProjectsForm
from app.models import Projects

class ProjectCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Projects
    form_class = ProjectsForm
    template_name = 'app/projects/add_project.html'
    context_object_name = 'view'
    success_url = reverse_lazy('projects')
    login_url = reverse_lazy('login')
    redirect_field_name = 'next'

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
        if not self.request.user.is_authenticated:
            return self.handle_no_authentication()
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'You are not authorized to add a project'
            }, status=403)
        raise PermissionDenied('You are not authorized to add a project')

    def handle_no_authentication(self):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'Please log in to continue',
                'redirect_url': f'{self.login_url}?{self.redirect_field_name}={self.request.path}'
            }, status=401)
        # Fix: Use redirect_to_login function correctly
        return redirect_to_login(
            self.request.get_full_path(),
            self.login_url,
            self.redirect_field_name
        )

    def form_valid(self, form):
        form.instance.title = titlecase(form.cleaned_data.get('title'))
        form.instance.description = titlecase(form.cleaned_data.get('description'))
        
        try:
            response = super().form_valid(form)
            
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Project added successfully',
                    'redirect_url': str(self.success_url)  # Ensure success_url is serialized as string
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
        context['form_title'] = 'Projects'
        return context
