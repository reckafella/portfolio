import random

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    ListView,
    UpdateView,
)
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, return_response
from blog.forms import BlogPostForm
from blog.models import BlogPost

uploader = CloudinaryImageHandler()


class CreatePostView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = BlogPost
    form_class = BlogPostForm
    template_name = "blog/create_post.html"
    context_object_name = "view"

    def form_valid(self, form):
        # Set the author and title
        form.instance.author = self.request.user
        form.instance.title = titlecase(form.instance.title)
        cover_image = form.files.get("cover_image")

        # Authorization check
        if not self.test_func():
            handle_no_permissions(
                self.request, "You do not have permission to create a post."
            )

        # Separate image upload from form validation
        try:
            image_data = handle_image_upload(
                instance=form.instance,
                uploader=uploader,
                image=cover_image,
                folder="portfolio/blog",
            )

            if image_data:
                form.instance.cloudinary_image_id = image_data["cloudinary_image_id"]
                form.instance.cloudinary_image_url = image_data["cloudinary_image_url"]
                form.instance.optimized_image_url = image_data["optimized_image_url"]

        except Exception as e:
            # Delete the post if an error occurs
            BlogPost.delete(form.instance, using="default")
            # Delete the image from Cloudinary if an error occurs
            if form.instance.cloudinary_image_id:
                uploader.delete_image(form.instance.cloudinary_image_id)
            response = {"success": False, "errors": str(e)}
            form.add_error(None, str(e))
            return return_response(self.request, response, 400)

        return super().form_valid(form)

    def test_func(self):
        return (
            self.request.user.is_staff or self.request.user == self.get_object().author
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({"title": "Create New Post", "submit_text": "Create Post"})
        return context

    def get_success_url(self):
        return reverse_lazy("blog:post_detail", kwargs={"slug": self.object.slug})


class PostDetailView(DetailView):
    model = BlogPost
    form_class = BlogPostForm
    template_name = "blog/post_detail.html"
    context_object_name = "post"

    def get_queryset(self):
        queryset = super().get_queryset()

        # If user is not authenticated, show only published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(published=True)

        # If user is authenticated but not the author or staff
        elif not self.request.user.is_staff:
            queryset = queryset.filter(Q(published=True) | Q(author=self.request.user))
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.get_object()

        # Only show other posts by the same author if:
        # 1. The post is published, OR
        # 2. The current user is the author, OR
        # 3. The current user is staff
        can_view_other_posts = (
            post.published
            or self.request.user == post.author
            or (self.request.user.is_authenticated and self.request.user.is_staff)
        )

        if can_view_other_posts:
            query = Q(author=post.author) & ~Q(id=post.id) & Q(published=True)
            if self.request.user.is_authenticated:
                query |= Q(author=self.request.user)
            if self.request.user.is_authenticated and self.request.user.is_staff:
                # Assuming unpublished posts should be visible to staff
                query |= Q(published=False)

            context["other_posts"] = BlogPost.objects.filter(query).order_by(
                "-created_at"
            )[: random.randint(3, 5)]
        else:
            context["other_posts"] = []
        context["form"] = self.form_class(instance=project)

        return context


class PostListView(ListView):
    model = BlogPost
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        topic = self.request.GET.get("topic", "all")
        sort = self.request.GET.get("sort", "date_desc")
        search_query = self.request.GET.get("q", "")

        order_by = {
            "date_desc": "-created_at",
            "date_asc": "created_at",
            "title_asc": "title",
            "title_desc": "-title",
            "author_asc": "author__username",
            "author_desc": "-author__username",
        }.get(sort, "-created_at")

        blog_posts = BlogPost.objects.all()

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
        """
        Return a dictionary of sorting options for the template
        """
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
    model = BlogPost
    template_name = "blog/posts_list.html"
    context_object_name = "articles"
    paginate_by = 6

    def get_queryset(self):
        self.author = get_object_or_404(User, username=self.kwargs["username"])
        topic = self.request.GET.get("topic", "all")
        sort = self.request.GET.get("sort", "date_desc")
        search_query = self.request.GET.get("q", "")

        order_by = {
            "date_desc": "-created_at",
            "date_asc": "created_at",
            "title_asc": "title",
            "title_desc": "-title",
        }.get(sort, "-created_at")

        posts = BlogPost.objects.filter(author=self.author)

        if search_query:
            posts = posts.filter(title__icontains=search_query) | posts.filter(
                content__icontains=search_query
            )

        if topic != "all":
            posts = posts.filter(topics__icontains=topic)

        return posts.order_by(order_by)

    def add_topics(self, articles):
        """
        Return a list of topics for the template
        """
        if not articles.exists():
            return []
        topics = set(topic.strip() for post in articles for topic in post.get_topics())
        topics.add("all")
        return sorted(topics)

    def add_sorting_options(self):
        """
        Return a dictionary of sorting options for the template
        """
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


class UpdatePostView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = BlogPost
    form_class = BlogPostForm
    template_name = "blog/create_post.html"

    def form_valid(self, form):
        cover_image = form.files.get("cover_image")
        post = form.instance
        post.title = titlecase(post.title)

        # Delete the old image from Cloudinary if a new image is being uploaded
        if cover_image and post.cloudinary_image_id:
            uploader.delete_image(post.cloudinary_image_id)

        # Upload new image to cloudinary
        if cover_image:
            try:
                image = uploader.upload_image(
                    cover_image,
                    folder="portfolio/blog",
                    public_id=uploader.get_public_id(post.title),
                    overwrite=True,
                )
                post.cloudinary_image_id = image["public_id"]
                post.cloudinary_image_url = image["secure_url"]
                post.optimized_image_url = uploader.get_optim_url(image["public_id"])
            except Exception as e:
                response = {"success": False, "errors": f"{str(e)}"}
                form.add_error(None, f"{str(e)}")
                return return_response(self.request, response, 400)

        return super().form_valid(form)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        return reverse_lazy("blog:post_detail", kwargs={"slug": self.object.slug})

    def form_invalid(self, form, error=None):
        if error:
            form.add_error(None, error)
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"Edit Post: {self.object.title}"
        return context


class DeletePostView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = BlogPost
    template_name = "blog/deletion/confirm_delete.html"
    success_url = reverse_lazy("blog:post_list")

    def delete(self, request, *args, **kwargs):
        post = self.get_object()

        # Delete image from cloudinary if it exists
        if post.cloudinary_image_id:
            try:
                uploader.delete_image(post.cloudinary_image_id)
            except Exception as e:
                response = {
                    "success": False,
                    "errors": f"Error deleting image: {str(e)}",
                }
                return return_response(request, response)

        return super().delete(request, *args, **kwargs)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff
