from django.views.generic import ListView
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.urls import reverse

from app.models import Projects
from app.views.helpers.helpers import is_ajax
from blog.models import BlogPostPage as BlogPost


class SearchView(ListView):
    template_name = "app/search/search.html"
    context_object_name = "combined_results"
    items_per_page = 6

    def get_queryset(self):
        """
        Override the get_queryset method to filter results based on query
        """
        # Get parameters from request
        self.query = self.request.GET.get("q", "") or\
            self.request.POST.get("q", "")
        self.category = self.request.GET.get("category", "all") or\
            self.request.POST.get("category", "all")
        self.sort = self.request.GET.get("sort", "relevance") or\
            self.request.POST.get("sort", "relevance")
        self.page = self.request.GET.get("page", 1) or\
            self.request.POST.get("page", 1)

        # Get filtered results
        self.post_results, self.project_results = self._get_filtered_results()

        # Apply sorting
        self.post_results, self.project_results = self._apply_sorting()

        # Pagination handled in get_context_data,
        # -- so just return combined queryset
        return {'posts': self.post_results, 'projects': self.project_results}

    def _get_filtered_results(self):
        """
        Helper method to get filtered results based on query and category
        """
        post_results = BlogPost.objects.none()
        project_results = Projects.objects.none()

        # If no query, show all results
        if not self.query:
            if self.category in ["all", "posts"]:
                post_results = BlogPost.objects.all()
            if self.category in ["all", "projects"]:
                project_results = Projects.objects.all()
            return post_results, project_results

        # If query exists, filter results
        if self.category in ["all", "posts"]:
            post_results = BlogPost.objects.filter(
                Q(title__icontains=self.query) |
                Q(content__icontains=self.query)
            )
        if self.category in ["all", "projects"]:
            project_results = Projects.objects.filter(
                Q(title__icontains=self.query) |
                Q(description__icontains=self.query) |
                Q(project_url__icontains=self.query) |
                Q(category__icontains=self.query) |
                Q(project_type__icontains=self.query)
            )
        return post_results, project_results

    def _apply_sorting(self):
        """Helper method to sort results"""
        if self.sort == "date_desc":
            return (
                self.post_results.order_by("-first_published_at"),
                self.project_results.order_by("-created_at")
            )
        elif self.sort == "date_asc":
            return (
                self.post_results.order_by("first_published_at"),
                self.project_results.order_by("created_at")
            )
        elif self.sort == "title_asc":
            return (
                self.post_results.order_by("title"),
                self.project_results.order_by("title")
            )
        elif self.sort == "title_desc":
            return (
                self.post_results.order_by("-title"),
                self.project_results.order_by("-title")
            )
        # if sort is relevance or any other value, return as is
        return (self.post_results, self.project_results)

    def _paginate_results(self, queryset):
        """Helper method to paginate results"""
        paginator = Paginator(queryset, self.items_per_page)
        try:
            return paginator.page(self.page)
        except PageNotAnInteger:
            return paginator.page(1)
        except EmptyPage:
            return paginator.page(paginator.num_pages)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Paginate results
        posts = self._paginate_results(self.post_results)
        projects = self._paginate_results(self.project_results)

        total_results = posts.paginator.count + projects.paginator.count
        _q = self.query
        if self.category == "all":
            _q = f"You searched for: {_q} in all categories"
        elif self.category == "posts":
            _q = f"You searched for: {_q} in posts"
        elif self.category == "projects":
            _q = f"You searched for: {_q} in projects"
        else:
            _q = "Search"

        # Add custom context
        context.update({
            "q": self.request.GET.get("q", ""),
            "category": self.category,
            "sort": self.sort,
            "posts": posts,
            "projects": projects,
            "page_title": _q,
            "data_loading_text": "Searching...",
            "total_results": total_results,
            "sort_options": {
                "relevance": "Relevance",
                "date_desc": "Date (Newest)",
                "date_asc": "Date (Oldest)",
                "title_asc": "Title (A-Z)",
                "title_desc": "Title (Z-A)",
            },
            "filter_options": {
                "all": "All",
                "posts": "Posts",
                "projects": "Projects",
            },
        })

        return context

    def render_to_response(self, context, **response_kwargs):
        if is_ajax(self.request):
            _q = self.query
            response = {
                "success": True,
                "message": f"Results for: {_q}" if _q else "Search",
                "redirect_url": reverse("search"),
            }
            return JsonResponse(response)

        return super().render_to_response(context, **response_kwargs)
