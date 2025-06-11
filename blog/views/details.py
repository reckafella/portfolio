from django.db.models import Q, Count
from django.urls import reverse_lazy
from django.views.generic import DetailView

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
            .order_by("-first_published_at")[:3]
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

        # Get all tags used by the articles in the queryset
        # Use distinct to avoid duplicates and annotate with count
        from taggit.models import Tag

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
from django.db.models import Q
from django.urls import reverse_lazy
from django.views.generic import DetailView

from blog.models import BlogPostPage
from blog.forms import BlogPostForm


class PostDetailView(DetailView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/post_details.html"
    context_object_name = "article"

    def get_queryset(self):
        queryset = BlogPostPage.objects.all()

        # If user is not authenticated, show only published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(live=True)
        # If user is authenticated but not staff
        elif not self.request.user.is_staff:
            # Show posts that are either live or authored by the current user
            queryset = queryset.filter(
                Q(live=True) | Q(author=self.request.user)
            )
        # If user is staff, show all posts
        else:
            queryset = queryset
        return queryset

    def get_other_posts(self, article):
        """ Returns a set of other posts in the recent posts section """
        articles = self.get_queryset()

        # Start with base query excluding the current article
        query = ~Q(id=article.id)

        # If user is not authenticated, show only published posts
        if not self.request.user.is_authenticated:
            query &= Q(live=True)
        # If user is authenticated but not staff
        elif not self.request.user.is_staff:
            # Show posts that are either live or authored by the current user
            query &= (Q(live=True) | Q(author=self.request.user))
        # If user is staff, show all posts (already excluded current article)

        num_posts = 5
        return set(
            articles.filter(query)
            .order_by("-first_published_at")[:num_posts]
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        article = self.get_object()
        articles = self.get_queryset()

        context["other_posts"] = self.get_other_posts(article)

        context["post_topics"] = article.get_topics()
        context["all_topics"] = self.add_topics(articles)
        context["form"] = self.form_class(instance=article)
        context['page_title'] = f'Update: {article.title}'
        context['submit_text'] = 'Update Post'
        context['action_url'] = reverse_lazy('blog:update_article',
                                             kwargs={'slug': article.slug})
        context['delete_url'] = reverse_lazy('blog:delete_article',
                                             kwargs={'slug': article.slug})

        return context

    def add_topics(self, articles):
        """
        Returns a list of tuples for all topics in the queryset
        + total number of articles for each article
        """
        if not articles.exists():
            return []
        topics = set(
            topic.strip() for post in articles for topic in post.get_topics()
        )
        try:
            topics.remove("all")
        except KeyError:
            pass
        topic_count = (
            [(topic,
              articles.filter(topics__icontains=topic).count()
              ) for topic in topics])

        all_count = articles.count()
        return sorted([("all", all_count)] + topic_count)
'''
