from django.db.models import Prefetch
from django.views.generic import DetailView, ListView
from django.http import Http404
from django.urls import reverse

from app.models import Projects, Image, Video
from app.forms.projects import ProjectsForm


class ProjectListView(ListView):
    model = Projects
    template_name = "app/projects/projects.html"
    context_object_name = "projects"
    paginate_by = 6

    def sorting_options(self):
        return {
            "date-asc": "Date (ASC)",
            "date-desc": "Date (DESC)",
            "title-asc": "Title (A-Z)",
            "title-desc": "Title (Z-A)",
            "category-asc": "Category (A-Z)",
            "category-desc": "Category (Z-A)",
            "original-order": "Original Order"
        }

    def get_queryset(self):
        sort = self.request.GET.get('sort-by')

        sort_by = {
            "date-asc": "created_at",
            "date-desc": "-created_at",
            "title-asc": "title",
            "title-desc": "-title",
            "category-asc": "category",
            "category-desc": "-category",
            "original-order": "id"
        }.get(sort, "-created_at")

        # Base queryset - staff can see all projects,
        # non-staff only see published
        if self.request.user.is_staff:
            base_queryset = Projects.objects.all()
        else:
            base_queryset = Projects.objects.filter(live=True)

        return base_queryset.prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        ).order_by(sort_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Projects"

        # Get projects for categories - staff can see all,
        # non-staff only published
        projects_for_categories = self.get_queryset()

        categories = projects_for_categories.values_list('category', flat=True)
        context["categories"] = list(dict.fromkeys([
            category for category in categories
        ]))
        context["categories"].sort()
        context["page_title"] = "Projects"

        context["current_category"] = self.request.GET.get('category', "all")
        context["sorting_options"] = self.sorting_options()
        context["sort_by"] = self.request.GET.get('sort_by', 'date-desc')

        # Add flag to template to show unpublished status
        context["is_staff"] = self.request.user.is_staff

        return context


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
