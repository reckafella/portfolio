from django.db.models import Prefetch
from django.http import Http404
from django.urls import reverse
from django.views.generic import DetailView, ListView

from app.forms.projects import ProjectsForm
from app.models import Image, Projects, Video


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
            "client-asc": "Client (A-Z)",
            "client-desc": "Client (Z-A)",
            "type-asc": "Type (A-Z)",
            "type-desc": "Type (Z-A)",
            "original-order": "Original Order"
        }

    def get_queryset(self):
        # Get filter parameters
        sort = self.request.GET.get('sort-by', self.request.GET.get('sort_by'))
        category = self.request.GET.get('category', 'all')
        project_type = self.request.GET.get('project_type', 'all')
        client = self.request.GET.get('client', 'all')
        search_title = self.request.GET.get('q', '').strip()

        sort_by = {
            "date-asc": "created_at",
            "date-desc": "-created_at",
            "title-asc": "title",
            "title-desc": "-title",
            "category-asc": "category",
            "category-desc": "-category",
            "client-asc": "client",
            "client-desc": "-client",
            "type-asc": "project_type",
            "type-desc": "-project_type",
            "original-order": "id"
        }.get(sort, "-created_at")

        # Base queryset - staff can see all projects,
        # non-staff only see published
        if self.request.user.is_staff:
            base_queryset = Projects.objects.all()
        else:
            base_queryset = Projects.objects.filter(live=True)

        # Apply filters
        if category and category != 'all':
            base_queryset = base_queryset.filter(category=category)

        if project_type and project_type != 'all':
            base_queryset = base_queryset.filter(project_type=project_type)

        if client and client != 'all':
            base_queryset = base_queryset.filter(client=client)

        if search_title:
            base_queryset = base_queryset.filter(
                title__icontains=search_title
            )

        return base_queryset.prefetch_related(
            Prefetch("images", queryset=Image.objects.filter(live=True)),
            Prefetch("videos", queryset=Video.objects.filter(live=True))
        ).order_by(sort_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Projects"

        # Get all projects for filter options (not filtered by current filters)
        if self.request.user.is_staff:
            all_projects = Projects.objects.all()
        else:
            all_projects = Projects.objects.filter(live=True)

        # Get unique values for filter dropdowns
        categories = all_projects.values_list('category', flat=True).distinct()
        context["categories"] = sorted(list(set(categories)))

        project_types = all_projects.values_list('project_type',
                                                 flat=True).distinct()
        context["project_types"] = sorted(list(set(project_types)))

        clients = all_projects.values_list('client', flat=True).distinct()
        context["clients"] = sorted(list(set(clients)))

        context["page_title"] = "Projects"

        # Current filter values
        context["current_category"] = self.request.GET.get('category', "all")
        context["current_project_type"] = self.request.GET.get('project_type',
                                                               "all")
        context["current_client"] = self.request.GET.get('client', "all")
        context["q"] = self.request.GET.get('q', "")

        context["sorting_options"] = self.sorting_options()

        # Handle both sort-by and sort_by parameters
        sort_param = (self.request.GET.get('sort-by') or
                      self.request.GET.get('sort_by', 'date-desc'))
        context["sort_by"] = sort_param

        # Add flag to template to show unpublished status
        context["is_staff"] = self.request.user.is_staff

        # Build current filter summary for display
        active_filters = []
        if context["current_category"] != "all":
            active_filters.append(f"Category: {context['current_category']}")
        if context["current_project_type"] != "all":
            active_filters.append(f"Type: {context['current_project_type']}")
        if context["current_client"] != "all":
            active_filters.append(f"Client: {context['current_client']}")
        if context["q"]:
            active_filters.append(f"Search: \"{context['q']}\"")

        context["active_filters"] = active_filters
        context["has_filters"] = len(active_filters) > 0

        # Debug info - you can remove this later
        filtered_count = self.get_queryset().count()
        context["debug_info"] = f"Found {filtered_count}\
            projects with current filters"

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
