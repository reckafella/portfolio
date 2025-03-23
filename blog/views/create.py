from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.utils.text import slugify
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostPage, BlogIndexPage
from blog.forms import BlogPostForm
from portfolio import settings


uploader = CloudinaryImageHandler()


class BasePostView(LoginRequiredMixin, UserPassesTestMixin):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_or_update_post.html"
    context_object_name = "view"

    def form_invalid(self, form, response=None):
        if is_ajax(self.request):
            errors = response.get("errors") if response else {}
            if not errors:
                errors = {field: form.errors[field] for field in form.errors}
            return JsonResponse({
                "success": False,
                "errors": errors
            }, status=400)
        return super().form_invalid(form)

    def upload_image(self, post, image):
        image_data = handle_image_upload(
            instance=post,
            uploader=uploader,
            image=image,
            folder=settings.POSTS_FOLDER,
        )

        if image_data:
            post.cloudinary_image_id = image_data["cloudinary_image_id"]
            post.cloudinary_image_url = image_data["cloudinary_image_url"]
            post.optimized_image_url = image_data["optimized_image_url"]

    def publish_post(self, post, should_publish):
        if should_publish:
            revision = post.save_revision()
            revision.publish()

    def handle_image_error(self, post, form, e):
        if post.cloudinary_image_id:
            uploader.delete_image(post.cloudinary_image_id)
        
        response = {"success": False, "errors": str(e)}
        form.add_error(None, str(e))
        if is_ajax(self.request):
            return self.form_invalid(form, response)
        return self.form_invalid(form, response)

    def get_success_url(self):
        return reverse_lazy("blog:article_details", kwargs={"slug": self.object.slug})


class CreatePostView(BasePostView, CreateView):
    def test_func(self):
        return self.request.user.is_staff

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Create New Post",
            "submit_text": "Create Post",
            "data_loading_text": "Creating Post...",
            "action_url": reverse_lazy("blog:create_article")
        })
        return context

    def save_post_to_parent(self, post):
        parent_page = BlogIndexPage.objects.first()

        if not parent_page:
            existing_page = BlogIndexPage.objects.filter(slug='blog-home').first()

            if existing_page:
                parent_page = existing_page
            else:
                with transaction.atomic():
                    parent_page = BlogIndexPage(
                        title="Blog Home",
                        slug="blog-home",
                    )
                    parent_page = BlogIndexPage.add_root(instance=parent_page)
                    parent_page.save()

        if not parent_page.id:
            raise ValueError("Blog Home page has not been assigned an ID!")

        parent_page.add_child(instance=post)

    def form_valid(self, form):
        post = form.instance
        post.author = self.request.user
        post.title = titlecase(post.title)
        post.slug = slugify(post.title)
        cover_image = form.files.get("cover_image")
        should_publish = form.cleaned_data.get('published', False)

        if not self.test_func():
            handle_no_permissions(self.request, "Not allowed to create a blog post.")

        if cover_image:
            try:
                self.upload_image(post, cover_image)
            except Exception as e:
                BlogPostPage.delete(post, using="default")
                return self.handle_image_error(post, form, e)

        self.save_post_to_parent(post)

        with transaction.atomic():
            post.save()
            self.publish_post(post, should_publish)

        response = super().form_valid(form)

        if is_ajax(self.request):
            return JsonResponse({
                "success": True,
                "message": "Post Created and Published Successfully" if should_publish else "Post created as Draft",
                "redirect_url": self.get_success_url()
            })
        return response
