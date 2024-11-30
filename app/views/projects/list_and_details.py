from django.views.generic import DetailView, ListView

from app.models import Projects


class ProjectListView(ListView):
    model = Projects
    template_name = 'app/projects/projects.html'
    context_object_name = 'projects'
    paginate_by = 6

    def get_queryset(self):
        projects = Projects.objects.all().order_by('-created_at')
        return projects

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Projects'
        context['form_title'] = 'Projects'
        context['projects'] = context['projects']
        return context


class ProjectDetailView(DetailView):
    model = Projects
    template_name = 'app/projects/project_detail.html'
    context_object_name = 'project'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()

        # Fetch related projects (random selection)
        context['related_projects'] = Projects.objects.exclude(
            id=project.id
        ).order_by('?')[:3]  # Get 3 random related projects

        # Additional context for page metadata
        context['page_title'] = project.title
        context['form_title'] = 'Project Details'

        return context
