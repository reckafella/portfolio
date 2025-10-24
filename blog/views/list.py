from datetime import datetime

from django.contrib.auth.models import User
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView
from taggit.models import Tag

from ..models import BlogPostPage


class BasePostListView(ListView):
    model = BlogPostPage
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        return BlogPostPage.objects.live()

    def get_tag_counts(self):
        """
        Returns a list of tuples for all tags in the queryset
        + total number of articles for each tag
        + Get all tags used by the articles in the queryset
        + Use distinct to avoid duplicates and annotate with count
        + Get tag IDs that are used by our filtered articles
        """
        articles = self.get_queryset()
        if not articles.exists():
            return []

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

    def get_sorting_options(self):
        return {
            "author-asc": "Author Asc",
            "author-desc": "Author Desc",
            "date-asc": "Date Asc",
            "date-desc": "Date Desc",
            "title-asc": "Title Asc",
            "title-desc": "Title Desc"
        }

    def get_sorting_attribute(self, sort):
        """
        Returns the attribute to sort by based on the selected option.
        """
        return {
            "date-asc": "first_published_at",
            "date-desc": "-first_published_at",
            "title-asc": "title",
            "title-desc": "-title",
            "author-asc": "author__username",
            "author-desc": "-author__username"
        }.get(sort, "-first_published_at")

    def get_sorting_by_attribute(self, sorting_options, sort):
        """
        Returns the attribute to sort by based on the selected option.
        """
        return sorting_options.get(sort, "-first_published_at")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["page_title"] = "Blog Posts"
        context["all_tags"] = self.get_tag_counts()
        context["current_tag"] = self.request.GET.get("tag", "all")
        context["current_sort"] = self.request.GET.get("sort", "date-desc")
        context["sorting_options"] = self.get_sorting_options()
        context["submit_text"] = "Read Article"
        context['share_article'] = "Share Article"
        context["q"] = self.request.GET.get("q", "")
        context["all_authors"] = True
        context["most_recent_posts"] = self.get_most_recent_posts()
        context["most_viewed_posts"] = self.get_most_viewed_posts()

        return context

    def get_most_recent_posts(self):
        """
        Returns the 5 most recent blog posts.
        """
        return BlogPostPage.objects.live().order_by("-first_published_at")[:5]

    def get_most_viewed_posts(self):
        """
        Returns the 5 most viewed blog posts from the queryset.
        """
        return BlogPostPage.objects.live().order_by("-view_count")[:5]


class PostListView(BasePostListView):
    def get_queryset(self):
        tag = self.request.GET.get("tag", "all")
        sort = self.request.GET.get("sort", "date-desc")
        search_query = self.request.GET.get("q", "")

        order_by = self.get_sorting_attribute(sort)

        articles = super().get_queryset()

        if search_query:
            articles = articles.filter(
                title__icontains=search_query
            ) | articles.filter(content__icontains=search_query)

        if tag != "all":
            articles = articles.filter(tags__name__iexact=tag)

        return articles.order_by(order_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["all_tags"] = self.get_tag_counts()
        context["sorting_options"] = self.get_sorting_options()

        return context


class AuthorPostsView(BasePostListView):
    def get_queryset(self):
        self.author = get_object_or_404(User, username=self.kwargs["username"])
        tag = self.request.GET.get("tag", "all")
        sort = self.request.GET.get("sort", "date-desc")
        search_query = self.request.GET.get("q", "")

        order_by = self.get_sorting_attribute(sort)

        articles = super().get_queryset()

        if search_query:
            articles = articles.filter(title__icontains=search_query) |\
                articles.filter(content__icontains=search_query)

        if tag != "all":
            articles = articles.filter(tags__name__iexact=tag)

        return articles.order_by(order_by)

    def get_sorting_options(self):
        return {
            "date-asc": "Date Asc",
            "date-desc": "Date Desc",
            "title-asc": "Title Asc",
            "title-desc": "Title Desc",
        }

    def get_sorting_attribute(self, sort):
        attributes = super().get_sorting_attribute(sort)
        # remove author sorting options
        if "author" in attributes:
            attributes.pop("author-asc", None)
            attributes.pop("author-desc", None)
        return attributes

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["author"] = self.author
        context["all_authors"] = False
        context["page_title"] = f'Posts by {self.author.username}'
        context["current_tag"] = self.request.GET.get("tag", "all")
        context["current_sort"] = self.request.GET.get("sort", "date-desc")
        context["sorting_options"] = self.get_sorting_options()
        context["all_tags"] = self.get_tag_counts()

        return context


class PostsByDateView(BasePostListView):
    def get_date_components(self):
        date_str = self.kwargs.get('date', '')
        try:
            # Handle different date formats (YYYY, YYYY-MM, YYYY-MM-DD)
            parts = date_str.split('-')
            year = int(parts[0])
            month = int(parts[1]) if len(parts) > 1 else None
            day = int(parts[2]) if len(parts) > 2 else None
            return year, month, day
        except (ValueError, IndexError):
            return None, None, None

    def get_sorting_options(self):
        return super().get_sorting_options()

    def get_queryset(self):
        year, month, day = self.get_date_components()
        if year is None:
            return redirect('blog:posts_list')

        articles = super().get_queryset()

        # Build date filter
        date_filter = {'first_published_at__year': year}
        if month:
            date_filter['first_published_at__month'] = month
        if day:
            date_filter['first_published_at__day'] = day

        articles = articles.filter(**date_filter)

        # Apply sorting
        sort = self.request.GET.get("sort", "date-desc")
        order_by = self.get_sorting_attribute(sort)

        return articles.order_by(order_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        year, month, day = self.get_date_components()

        # Format the page title based on date components
        if day:
            date_obj = datetime(year, month, day)
            title = date_obj.strftime('%B %d, %Y')
        elif month:
            date_obj = datetime(year, month, 1)
            title = date_obj.strftime('%B, %Y')
        else:
            title = str(year)

        context["page_title"] = f'Posts from {title}'
        context["all_authors"] = True
        context["current_tag"] = self.request.GET.get("tag", "all")
        context["search_query"] = self.request.GET.get("q", "")
        context["current_sort"] = self.request.GET.get("sort", "date-desc")
        context["all_tags"] = self.get_tag_counts()
        context["sorting_options"] = self.get_sorting_options()

        return context


class PostsByTagView(BasePostListView):
    def get_queryset(self):
        tag = self.kwargs["tag"]
        sort = self.request.GET.get("sort", "date-desc")
        search_query = self.request.GET.get("q", "")

        order_by = self.get_sorting_attribute(sort)

        """ if tag == 'all':
            articles = super().get_queryset()
        else:
            articles = super().get_queryset()
            articles = articles.filter(tags__name__iexact=tag) """
        articles = BlogPostPage.objects.live() if tag == 'all' else\
            BlogPostPage.objects.live().filter(tags__name__iexact=tag)

        if search_query:
            articles = articles.filter(title__icontains=search_query) |\
                articles.filter(content__icontains=search_query)

        return articles.order_by(order_by)

    def get_sorting_options(self):
        return super().get_sorting_options()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["page_title"] = f'Tag: {self.kwargs["tag"].capitalize()}'
        context["all_tags"] = self.get_tag_counts()
        context["current_tag"] = self.kwargs["tag"]
        context["current_sort"] = self.request.GET.get("sort", "date-desc")
        context["sorting_options"] = self.get_sorting_options()

        return context
