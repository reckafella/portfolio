from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.text import slugify
from django.views.generic import UpdateView
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostImage
from blog.models import BlogPostPage as BlogPost
from blog.views.base import BasePostView

# from portfolio import settings


Uploader = CloudinaryImageHandler()


class UpdatePostView(BasePostView, UpdateView):
    def test_func(self):
        """ post = self.get_object()
        return self.request.user.is_staff or self.request.user == post.author """
        return super().test_func()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Update Blog Post",
            "submit_text": "Update Post",
            "data_loading_text": "Updating Post",
            "action_url": reverse_lazy(
                "blog:update_article",
                kwargs={"slug": self.object.slug}
            ),
            "form_id": "update-post-form",
        })
        return context

    def update_post_slug(self, original_post, current_post):
        cp = current_post
        if original_post.title != cp.title:
            cp.title = titlecase(cp.title)
            base_slug = slugify(cp.title)
            counter = 1
            ns = base_slug

            while BlogPost.objects.filter(slug=ns).exclude(id=cp.id).exists():
                ns = f"{base_slug}-{counter}"
                counter += 1
            cp.slug = ns

    def form_valid(self, form):
        """
        Handle the form submission and save the post.
        """
        if not self.test_func():
            handle_no_permissions(
                self.request,
                "Not Allowed to edit this post."
            )

        post = form.instance
        original_post = self.get_object()
        should_publish = form.cleaned_data.get('published', False)
        editor_type = form.cleaned_data.get('editor_type', 'simple')
        post.author = self.request.user
        cover_image = form.files.get("cover_image")

        self.update_post_slug(original_post, post)

        if cover_image:
            self.save_image_to_db(post, form, cover_image)

        with transaction.atomic():
            response = super().form_valid(form)
            self.publish_post(post, should_publish)

        if is_ajax(self.request):
            if should_publish:
                message = "Post Updated and Published Successfully"
            else:
                message = "Post updated as Draft"

            # For advanced content type, redirect to Wagtail admin
            if editor_type == 'advanced':
                wagtail_edit_url = f"/wagtail/admin/pages/{post.id}/edit/"
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

        # For non-AJAX requests
        if editor_type == 'advanced':
            from django.shortcuts import redirect
            wagtail_edit_url = f"/wagtail/admin/pages/{post.id}/edit/"
            return redirect(wagtail_edit_url)

        return response
