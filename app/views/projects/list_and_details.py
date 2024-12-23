from django.views.generic import DetailView, ListView

from app.models import Projects
from app.forms import ProjectsForm


class ProjectListView(ListView):
    model = Projects
    template_name = "app/projects/projects.html"
    context_object_name = "projects"
    paginate_by = 6

    def get_queryset(self):
        projects = Projects.objects.all().order_by("created_at")
        return projects

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Projects"
        return context


class ProjectDetailView(DetailView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/project_detail.html"
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()

        # Fetch related projects (random selection)
        context["related_projects"] = Projects.objects.exclude(
            id=project.id).order_by("?")[:5]

        # Additional context for page metadata
        context["page_title"] = project.title
        context["form_title"] = "Project Details"
        context["form"] = self.form_class(instance=project)

        return context
