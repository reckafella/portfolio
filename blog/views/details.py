from django.db.models import Q
from django.urls import reverse_lazy
from django.views.generic import DetailView
from django.utils import timezone
from datetime import timedelta
import hashlib

from blog.models import BlogPostPage
from blog.forms import BlogPostForm


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

    def get_this_object(self, queryset=None):
        """Override to increment view count when object is accessed"""
        obj = super().get_object(queryset)

        # Only increment view count for legitimate page views
        if self.should_increment_view_count(obj):
            obj.increment_view_count(request=self.request)

        return obj

    def should_increment_view_count(self, article):
        """
        Determine if we should increment the view count based\
            on various factors
        """
        # Don't count views from the author (optional)
        user = self.request.user
        if user.is_authenticated and user == article.author:
            return False

        # Don't count views from staff users (optional)
        if user.is_authenticated and user.is_staff:
            return False

        # Create a unique identifier for this visitor + article combination
        visitor_id = self.get_visitor_identifier()
        session_key = f'viewed_post_{article.slug}_{visitor_id}'

        # Check if this visitor has already viewed this post recently
        if self.request.session.get(session_key):
            return False

        # Check for rapid successive requests from the same IP
        if self.is_rate_limited(visitor_id):
            return False

        # Mark as viewed in session (expires when session expires)
        self.request.session[session_key] = True

        # Also set a shorter cooldown period for rate limiting
        cooldown_key = f'view_cooldown_{visitor_id}'
        self.request.session[cooldown_key] = timezone.now().timestamp()

        return True

    def get_visitor_identifier(self):
        """
        Create a semi-unique identifier for the visitor
        Combines IP address and User-Agent for better uniqueness
        """
        # Get client IP address
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR', '')

        # Get user agent
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')

        # Create hash of IP + User Agent for privacy
        identifier = hashlib.md5(f"{ip}_{user_agent}".encode()).hexdigest()
        return identifier

    def is_rate_limited(self, visitor_id):
        """
        Check if visitor is making requests too quickly
        Prevents rapid refreshing to inflate view counts
        """
        cooldown_key = f'view_cooldown_{visitor_id}'
        last_view_time = self.request.session.get(cooldown_key)

        if last_view_time:
            # Convert timestamp back to datetime
            last_view = timezone.datetime.fromtimestamp(
                last_view_time, tz=timezone.get_current_timezone())

            # Set cooldown period (e.g., 30 seconds)
            if timezone.now() - last_view < timedelta(seconds=30):
                return True

        return False

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
        article = self.get_this_object()
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


'''
from django.db.models import Q, Count
from django.urls import reverse_lazy
from django.views.generic import DetailView
from taggit.models import Tag

from blog.models import BlogPostPage
from blog.forms import BlogPostForm


class PostDetailView(DetailView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/post_details.html"
    context_object_name = "article"

    def get_queryset(self):
        # queryset = super().get_queryset().select_related("author")
        queryset = BlogPostPage.objects.all().select_related("author")
        user = self.request.user

        if not user.is_authenticated:
            return queryset.filter(live=True)

        # For authenticated non-staff, show their drafts plus all live posts.
        if not user.is_staff:
            return queryset.filter(Q(live=True) | Q(author=user))

        # Staff users can see all posts.
        return queryset

    def get_other_posts(self, current_article, queryset, limit=5):
        """
        Return a queryset of other recent posts.

        The incoming 'queryset' is already permission-filtered.
        Ensures the 'current_article' is excluded and results are ordered.

        Exclude the current article using its primary key (pk).
        Order by most recent publication date and limit to 5 posts.
        """
        # check if the sluf is valid in the queryset
        if not queryset.filter(slug=current_article.slug).exists():
            return queryset.none()

        return (
            queryset.exclude(slug=current_article.slug)
            .order_by("-first_published_at")
            .distinct()[:limit]
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        article = self.get_object()
        visible_articles = self.get_queryset()

        context["other_posts"] = self.get_other_posts(
            article, visible_articles, limit=3)

        context["post_tags"] = article.get_tags()
        context["all_tags"] = self.add_tags(visible_articles)
        context["form"] = self.form_class(instance=article)
        context['page_title'] = f'Update: {article.title}'
        context['submit_text'] = 'Update Post'
        context['action_url'] = reverse_lazy('blog:update_article',
                                             kwargs={'slug': article.slug})
        context['delete_url'] = reverse_lazy('blog:delete_article',
                                             kwargs={'slug': article.slug})

        return context

    def add_tags(self, articles):
        """
        Returns a list of tuples for all tags in the queryset
        + total number of articles for each tag
        """
        if not articles.exists():
            return []

        # Get tag IDs that are used by our filtered articles
        article_ids = list(articles.values_list('id', flat=True))

        # Query tags that are associated with these articles
        tags_with_counts = (
            Tag.objects
            .filter(
                taggit_taggeditem_items__object_id__in=article_ids,
                taggit_taggeditem_items__content_type__model='blogpostpage'
            ).annotate(article_count=Count('taggit_taggeditem_items',
                                           distinct=True)).order_by('name'))

        tag_count = [(tag.name, tag.article_count) for tag in tags_with_counts]

        all_count = articles.count()
        return [("all", all_count)] + tag_count
'''
