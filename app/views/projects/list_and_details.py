from django.db.models import Prefetch
from django.views.generic import DetailView, ListView

from app.models import Projects, Image, Video
from app.forms.projects import ProjectsForm


class ProjectListView(ListView):
    model = Projects
    template_name = "app/projects/projects.html"
    context_object_name = "projects"
    # paginate_by = 6

    def sorting_options(self):
        return {
            "date_asc": "Date (ASC)",
            "date_desc": "Date (DESC)",
            "title_asc": "Title (A-Z)",
            "title_desc": "Title (Z-A)",
            "category_asc": "Category (A-Z)",
            "category_desc": "Category (Z-A)",
        }

    def get_queryset(self):
        sort = self.request.GET.get('sort_by')

        sort_by = {
            "date_asc": "created_at",
            "date_desc": "-created_at",
            "title_asc": "title",
            "title_desc": "-title",
            "category_asc": "category",
            "category_desc": "-category",
        }.get(sort, "-created_at")
        return Projects.objects.filter(live=True).prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        ).order_by(sort_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Projects"
        PROJECTS = Projects.objects.filter(live=True)
        categories = PROJECTS.values_list('category', flat=True)
        context["categories"] = list(dict.fromkeys([
            category for category in categories
        ]))
        # context["default_image"] = "assets/images/software-dev.webp"
        context["categories"].sort()
        context["sorting_options"] = self.sorting_options()
        context["sort_by"] = self.request.GET.get('sort_by', 'date_desc')
        return context


class ProjectDetailView(DetailView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/project_detail.html"
    context_object_name = "project"

    def get_queryset(self):
        # Prefetching images & youtube thumbnails to optimize database queries
        return Projects.objects.filter(live=True).prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()
        # section below to be revisited
        url = ""

        context["related_projects"] = Projects.objects.exclude(
            id=project.id).order_by("?")[:5]
        context["page_title"] = project.title
        context["form_title"] = f"Project Details - {project.title}"
        context["default_image_url"] = url
        context["form"] = self.form_class(instance=project)

        return context
