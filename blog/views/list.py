from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.generic import ListView
from django.shortcuts import get_object_or_404

from blog.models import BlogPostPage


class PostListView(ListView):
    model = BlogPostPage
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        topic = self.request.GET.get("topic", "all")
        sort = self.request.GET.get("sort", "date_desc")
        search_query = self.request.GET.get("q", "")

        order_by = {
            "date_desc": "-first_published_at",
            "date_asc": "first_published_at",
            "title_asc": "title",
            "title_desc": "-title",
            "author_asc": "author__username",
            "author_desc": "-author__username",
        }.get(sort, "-first_published_at")

        blog_posts = BlogPostPage.objects.live()  # Only live (published) pages

        if search_query:
            blog_posts = blog_posts.filter(
                title__icontains=search_query
            ) | blog_posts.filter(content__icontains=search_query)

        if topic != "all":
            blog_posts = blog_posts.filter(topics__icontains=topic)

        return blog_posts.order_by(order_by)

    def add_topics(self, articles):
        if not articles.exists():
            return []
        topics = set(topic.strip() for post in articles for topic in post.get_topics())
        topics.add("all")
        return sorted(topics)

    def add_sorting_options(self):
        return {
            "date_desc": "Date (Newest First)",
            "date_asc": "Date (Oldest First)",
            "title_asc": "Title (A-Z)",
            "title_desc": "Title (Z-A)",
            "author_asc": "Author (A-Z)",
            "author_desc": "Author (Z-A)",
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        articles = self.get_queryset()

        context["page_title"] = "Blog Posts"
        context["submit_text"] = "Read Article"

        context["topics"] = self.add_topics(articles)
        context["current_topic"] = self.request.GET.get("topic", "all")
        context["current_sort"] = self.request.GET.get("sort", "date_desc")
        context["sorting_options"] = self.add_sorting_options()
        context["q"] = self.request.GET.get("q", "")
        context["all_authors"] = True

        return context


class AuthorPostsView(ListView):
    model = BlogPostPage
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        self.author = get_object_or_404(User, username=self.kwargs["username"])
        topic = self.request.GET.get("topic", "all")
        sort = self.request.GET.get("sort", "date_desc")
        search_query = self.request.GET.get("q", "")

        order_by = {
            "date_desc": "-first_published_at",
            "date_asc": "first_published_at",
            "title_asc": "title",
            "title_desc": "-title",
        }.get(sort, "-first_published_at")

        posts = BlogPostPage.objects.live().filter(author=self.author)

        if search_query:
            posts = posts.filter(title__icontains=search_query) | posts.filter(
                content__icontains=search_query
            )

        if topic != "all":
            posts = posts.filter(topics__icontains=topic)

        return posts.order_by(order_by)

    def add_topics(self, articles):
        if not articles.exists():
            return []
        topics = set(topic.strip() for post in articles for topic in post.get_topics())
        topics.add("all")
        return sorted(topics)

    def add_sorting_options(self):
        return {
            "date_desc": "Date (Newest First)",
            "date_asc": "Date (Oldest First)",
            "title_asc": "Title (A-Z)",
            "title_desc": "Title (Z-A)",
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        articles = self.get_queryset()

        context["author"] = self.author
        context["page_title"] = "Blog Posts"
        context["topics"] = self.add_topics(articles)
        context["current_topic"] = self.request.GET.get("topic", "all")
        context["current_sort"] = self.request.GET.get("sort", "date_desc")
        context["sorting_options"] = self.add_sorting_options()
        context["submit_text"] = "Read Article"
        context["q"] = self.request.GET.get("q", "")
        context["all_authors"] = False

        return context


class TopicPostsView(ListView):
    model = BlogPostPage
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        topic = self.kwargs["topic"]
        sort = self.request.GET.get("sort", "date_desc")
        search_query = self.request.GET.get("q", "")

        order_by = {
            "date_desc": "-first_published_at",
            "date_asc": "first_published_at",
            "title_asc": "title",
            "title_desc": "-title",
            "author_asc": "author__username",
            "author_desc": "-author__username",
        }.get(sort, "-first_published_at")

        posts = BlogPostPage.objects.live() if topic == 'all' else BlogPostPage.objects.live().filter(topics__icontains=topic)

        if search_query:
            posts = posts.filter(title__icontains=search_query) | posts.filter(
                content__icontains=search_query
            )

        return posts.order_by(order_by)

    def add_topics(self, articles):
        if not articles.exists():
            return []
        topics = set(topic.strip() for post in articles for topic in post.get_topics())
        topics.add("all")
        return sorted(topics)

    def add_sorting_options(self):
        return {
            "date_desc": "Date (Newest First)",
            "date_asc": "Date (Oldest First)",
            "title_asc": "Title (A-Z)",
            "title_desc": "Title (Z-A)",
            "author_asc": "Author (A-Z)",
            "author_desc": "Author (Z-A)",
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        articles = self.get_queryset()

        context["page_title"] = f'Topic: {self.kwargs["topic"].capitalize()}'
        context["topics"] = self.add_topics(articles)
        context["current_topic"] = self.kwargs["topic"]
        context["current_sort"] = self.request.GET.get("sort", "date_desc")
        context["sorting_options"] = self.add_sorting_options()
        context["submit_text"] = "Read Article"
        context["q"] = self.request.GET.get("q", "")
        context["all_authors"] = True

        return context
