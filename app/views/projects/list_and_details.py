from django.db.models import Prefetch
from django.views.generic import DetailView, ListView

from app.models import Projects, Image, Video
from app.forms.projects import ProjectsForm


class ProjectListView(ListView):
    model = Projects
    template_name = "app/projects/projects.html"
    context_object_name = "projects"
    paginate_by = 4

    def get_queryset(self):
        return Projects.objects.all().order_by("created_at")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Projects"
        context["categories"] = list(dict.fromkeys([
            category for category in Projects.objects.values_list('category', flat=True)
        ]))
        context["categories"].sort()
        return context

class ProjectDetailView(DetailView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/project_detail.html"
    context_object_name = "project"

    def get_queryset(self):
        # Prefetching images and youtube urls/thumbnails to optimize database queries
        return Projects.objects.prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()
        url = "https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/mbaek/contact/zhgi2apdv9pxyrxmx9og"

        context["related_projects"] = Projects.objects.exclude(
            id=project.id).order_by("?")[:5]
        context["page_title"] = project.title
        context["form_title"] = "Project Details"
        context["default_image_url"] = url
        context["form"] = self.form_class(instance=project)

        return context
""" class ProjectDetailView(DetailView):
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
 """
