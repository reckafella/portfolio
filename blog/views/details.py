from django.db.models import Q
from django.urls import reverse_lazy
from django.views.generic import DetailView

from blog.forms import BlogPostForm
from blog.models import BlogPostPage
from portfolio.utils.rate_limiting import can_increment_view_count


class PostDetailView(DetailView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/post_details.html"
    context_object_name = "article"

    def get_queryset(self):
        queryset = super().get_queryset().select_related("author")

        if not self.request.user.is_authenticated:
            return queryset.filter(live=True)

        # For authenticated non-staff, show their drafts plus all live posts.
        if not self.request.user.is_staff:
            return queryset.filter(Q(live=True) | Q(author=self.request.user))

        # Staff users can see all posts.
        return queryset

    def get_object(self, queryset=None):
        """Override to increment view count when object is accessed"""
        obj = super().get_object(queryset)

        # Use unified rate limiting system for view count increments
        if can_increment_view_count(self.request, obj.slug):
            obj.increment_view_count(request=self.request)

        return obj

    def get_other_posts(self, current_article, queryset):
        """
        Returns a queryset of other recent posts.
        The incoming 'queryset' is already permission-filtered.
        Ensures the 'current_article' is excluded and results are ordered.
        """
        # Exclude the current article using its primary key (pk)
        # Order by most recent publication date and limit to 5 posts.
        return (
            queryset.exclude(slug=current_article.slug)
            .order_by("-first_published_at")[:5]
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        article = self.get_object()
        visible_articles = self.get_queryset()

        context["other_posts"] = self.get_other_posts(article,
                                                      visible_articles)

        context["post_tags"] = article.get_tags()
        context["all_tags"] = self.add_tags(visible_articles)
        context["form"] = self.form_class(instance=article)
        context['page_title'] = f'Update: {article.title}'
        context['submit_text'] = 'Update Post'
        context['update_url'] = reverse_lazy('blog:update_article',
                                             kwargs={'slug': article.slug})
        context['delete_url'] = reverse_lazy('blog:delete_article',
                                             kwargs={'slug': article.slug})

        # Add form ID for JavaScript handling
        context['update_form_id'] = 'update-post-form'
        context['delete_form_id'] = 'delete-post-form'

        return context

    def add_tags(self, articles):
        """
        Returns a list of tuples for all tags in the queryset
        + total number of articles for each tag
        """
        try:
            return BlogPostPage.get_tag_counts()
        except Exception:
            return []
