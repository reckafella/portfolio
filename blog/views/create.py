from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.text import slugify
from django.views.generic import CreateView
from titlecase import titlecase

from ...app.views.helpers.helpers import handle_no_permissions, is_ajax
from ..models import BlogIndexPage
from ..views.base import BasePostView


class CreatePostView(BasePostView, CreateView):
    def test_func(self):
        return super().test_func()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Create New Post",
            "submit_text": "Create Post",
            "data_loading_text": "Creating Post",
            "action_url": reverse_lazy("blog:create_article"),
            "form_id": "create-post-form",
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

    def prepare_post_data(self, form):
        """Prepare post instance with form data."""
        post = form.instance
        post.author = self.request.user
        post.title = titlecase(post.title)
        post.slug = slugify(post.title)
        post.seo_title = titlecase(post.title) or ''
        post.seo_description = post.seo_title or ''
        return post

    def create_post_with_image(self, post, cover_image, should_publish):
        """Create post with optional cover image and publishing."""
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

    def get_success_message(self, should_publish):
        """Get appropriate success message."""
        if should_publish:
            return "Blog Post Created and Published Successfully"
        else:
            return "Blog Post Draft Created Successfully"

    def handle_ajax_response(self, should_publish, editor_type):
        """Handle AJAX response with appropriate redirects."""
        message = self.get_success_message(should_publish)

        # For advanced content type, redirect to Wagtail admin
        if editor_type == 'advanced':
            wagtail_edit_url = f"/wagtail/admin/pages/{self.object.id}/edit/"
            return JsonResponse({
                "success": True,
                "message": f"{message}. Redirecting to advanced editor...",
                "redirect_url": wagtail_edit_url
            })

        return JsonResponse({
            "success": True,
            "message": message,
            "redirect_url": self.get_success_url()
        })

    def handle_non_ajax_response(self, editor_type, response):
        """Handle non-AJAX response with appropriate redirects."""
        if editor_type == 'advanced':
            from django.shortcuts import redirect
            wagtail_edit_url = f"/wagtail/admin/pages/{self.object.id}/edit/"
            return redirect(wagtail_edit_url)
        return response

    def form_valid(self, form):
        if not self.test_func():
            handle_no_permissions(self.request,
                                  "Not allowed to create a blog post.")

        post = self.prepare_post_data(form)
        cover_image = form.files.get("cover_image")
        should_publish = form.cleaned_data.get('published', False)
        editor_type = form.cleaned_data.get('editor_type', 'simple')

        try:
            self.create_post_with_image(post, cover_image, should_publish)
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
            return self.handle_ajax_response(should_publish, editor_type)

        return self.handle_non_ajax_response(editor_type, response)

    def get_success_url(self):
        return super().get_success_url()
