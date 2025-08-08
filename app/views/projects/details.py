from django.db.models import Prefetch
from django.http import Http404
from django.urls import reverse
from django.views.generic import DetailView

from app.forms.projects import ProjectsForm
from app.models import Image, Projects, Video


class ProjectDetailView(DetailView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/project_details.html"
    context_object_name = "project"

    def get_queryset(self):
        # Staff can view all projects, non-staff only published ones
        if self.request.user.is_staff:
            base_queryset = Projects.objects.all()
        else:
            base_queryset = Projects.objects.filter(live=True)

        return base_queryset.prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        )

    def get_object(self, queryset=None):
        """
        Override to handle 404 for non-staff users\
            trying to access unpublished projects
        """
        obj = super().get_object(queryset)

        # If user is not staff and project is not live, raise 404
        if not self.request.user.is_staff and not obj.live:
            raise Http404("Project not found")

        return obj

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()
        url = ""

        # For related projects, show appropriate ones based on user type
        if self.request.user.is_staff:
            related_projects = Projects.objects.exclude(
                id=project.id).order_by("?")[:5]
        else:
            related_projects = Projects.objects.filter(live=True).exclude(
                id=project.id).order_by("?")[:5]

        context["related_projects"] = related_projects
        context["page_title"] = project.title
        context["form_title"] = f"Project Details - {project.title}"
        context["default_image_url"] = url
        context["form"] = self.form_class(instance=project)
        context["update_form_id"] = "project-update-form"
        context["delete_form_id"] = "project-delete-form"
        context["update_url"] = reverse("app:update_project",
                                        kwargs={"slug": project.slug})
        context["delete_url"] = reverse("app:delete_project",
                                        kwargs={"slug": project.slug})

        # Add flag to template to show unpublished status
        context["is_staff"] = self.request.user.is_staff

        return context
