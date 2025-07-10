from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.utils.text import slugify
from titlecase import titlecase

from app.views.helpers.cloudinary import (
    CloudinaryImageHandler, handle_image_upload)
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostPage, BlogIndexPage
from blog.forms import BlogPostForm
from portfolio import settings
from blog.models import BlogPostImage


uploader = CloudinaryImageHandler()


class BasePostView(LoginRequiredMixin, UserPassesTestMixin):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_or_update_post.html"
    context_object_name = "view"

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser

    def form_invalid(self, form):
        """
         Handles form validation errors, esp. in AJAX requests
        """
        if is_ajax(self.request):
            error_messages = []

            # field-specific errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")
            # non-field errors
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # for non-ajax requests
        return super().form_invalid(form)

    def upload_image(self, post, cover_image):
        return handle_image_upload(
            instance=post,
            uploader=uploader,
            image=cover_image,
            folder=settings.POSTS_FOLDER,
        )

    def save_image_to_db(self, post, cover_image):
        """
        Save the image data to the post and create a BlogPostImage instance.
        """
        if not post:
            raise ValueError("Post instance is required.")
        if not cover_image:
            raise ValueError("Cover image is required.")
        image_data = self.upload_image(post, cover_image)
        try:
            BlogPostImage.objects.create(
                post=post,
                cloudinary_image_id=image_data["cloudinary_image_id"],
                cloudinary_image_url=image_data["cloudinary_image_url"],
                optimized_image_url=image_data["optimized_image_url"]
            )
        except Exception as e:
            raise ValueError(f"Error saving image: {str(e)}")

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
        return reverse_lazy("blog:article_details",
                            kwargs={"slug": self.object.slug})


class CreatePostView(BasePostView, CreateView):
    def test_func(self):
        return super().test_func()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Create New Post",
            "submit_text": "Create Post",
            "data_loading_text": "Creating Post",
            "action_url": reverse_lazy("blog:create_article")
        })
        return context

    def save_post_to_parent(self, post):
        parent_page = BlogIndexPage.objects.first()

        if not parent_page:
            existing_page = BlogIndexPage.objects.filter(slug='blog-home')\
                .first()

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
        if not self.test_func():
            handle_no_permissions(self.request,
                                  "Not allowed to create a blog post.")

        post = form.instance
        post.author = self.request.user
        post.title = titlecase(post.title)
        post.slug = slugify(post.title)
        cover_image = form.files.get("cover_image")
        should_publish: bool = form.cleaned_data.get('published', False)

        try:
            with transaction.atomic():
                # Save the post to the parent first
                self.save_post_to_parent(post)

                # Save the post instance
                post.save()

                # Handle cover image if provided
                if cover_image:
                    self.save_image_to_db(post, cover_image)

                # Publish if requested
                self.publish_post(post, should_publish)

        except Exception as e:
            # If anything fails, clean up
            if post.pk:
                try:
                    post.delete()
                except Exception:
                    pass
            return self.handle_image_error(post, form, e)

        # Set the object for the success URL
        self.object = post
        response = super().form_valid(form)

        if is_ajax(self.request):
            if should_publish:
                message = "Blog Post Created and Published Successfully"
            else:
                message = "Blog Post Draft Created Successfully"
            return JsonResponse({
                "success": True,
                "message": message,
                "redirect_url": self.get_success_url()
            })
        return response

    def get_success_url(self):
        return super().get_success_url()
