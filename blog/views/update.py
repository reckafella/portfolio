from django.urls import reverse_lazy
from django.views.generic import UpdateView
from titlecase import titlecase
from django.http import JsonResponse
from django.db import transaction
from django.utils.text import slugify

from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostPage
from blog.views.create import BasePostView


uploader = CloudinaryImageHandler()



class UpdatePostView(BasePostView, UpdateView):
    def test_func(self):
        post = self.get_object()
        return self.request.user.is_staff or self.request.user == post.author

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Update Blog Post",
            "submit_text": "Update Post",
            "action_url": reverse_lazy(
                "blog:update_blog_post",
                kwargs={"slug": self.object.slug}
            )
        })
        return context

    def update_post_slug(self, original_post, current_post):
        if original_post.title != current_post.title:
            current_post.title = titlecase(current_post.title)
            base_slug = slugify(current_post.title)
            counter = 1
            new_slug = base_slug
            while BlogPostPage.objects.filter(slug=new_slug).exclude(id=current_post.id).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            current_post.slug = new_slug

    def form_valid(self, form):
        try:
            post = form.instance
            original_post = self.get_object()
            should_publish = form.cleaned_data.get('published', False)
            
            self.update_post_slug(original_post, post)
            post.author = self.request.user

            if not self.test_func():
                handle_no_permissions(self.request, "Not Allowed to edit this post.")

            cover_image = form.files.get("cover_image")
            
            if cover_image:
                try:
                    if post.cloudinary_image_id:
                        uploader.delete_image(post.cloudinary_image_id)
                    self.upload_image(post, cover_image)
                except Exception as e:
                    return self.handle_image_error(post, form, e)

            with transaction.atomic():
                response = super().form_valid(form)
                self.publish_post(post, should_publish)

            if is_ajax(self.request):
                return JsonResponse({
                    "success": True,
                    "message": "Post Updated and Published Successfully" if should_publish else "Post updated as Draft",
                    "redirect_url": self.get_success_url()
                })
            return response

        except Exception as e:
            response = {"success": False, "errors": str(e)}
            return JsonResponse(response, status=400)



'''class UpdatePostView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_or_update_post.html"
    context_object_name = "view"

    def form_valid(self, form):
        try:
            post = form.instance
            original_post = self.get_object()
            should_publish = form.cleaned_data.get('published', False)

            # Check if title has changed
            self.update_post_slug(original_post, post)
            post.author = self.request.user

            # Authorization check
            if not self.test_func():
                handle_no_permissions(self.request, "Not Allowed to edit this post.")

            cover_image = form.files.get("cover_image")

            # Handle image upload if present
            if cover_image:
                try:
                    self.upload_image(post, cover_image)
                except Exception as e:
                    errors = ", ".join(e) if isinstance(e, list) else str(e)
                    response = {"success": False, "errors": errors}
                    form.add_error(None, errors)
                    return self.form_invalid(form, response)

            # Check if post should be published or saved as draft
            with transaction.atomic():
                post.save()
                self.publish_post(post, should_publish)

            if is_ajax(self.request):
                return JsonResponse({
                    "success": True,
                    "message": "Post updated and published successfully" if should_publish else "Post updated as draft",
                    "redirect_url": self.get_success_url()
                })
            return super().form_valid(form)

        except Exception as e:
            response = {"success": False, "errors": str(e)}
            return JsonResponse(response, status=400)

    def form_invalid(self, form, response=None):
        if is_ajax(self.request):
            errors = response.get("errors") if response else {}
            if not errors:
                errors = {k: v[0] for k, v in form.errors.items()}
            return JsonResponse({
                "success": False,
                "errors": errors
            }, status=400)
        return super().form_invalid(form)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        return reverse_lazy(
            "blog:blog_post_details",
            kwargs={"slug": self.object.slug}
        )

    def publish_post(self, post, should_publish):
        if should_publish:
            revision = post.save_revision()
            revision.publish()

    def update_post_slug(self, original_post, current_post):
        if original_post.title != current_post.title:
            current_post.title = titlecase(current_post.title)
            base_slug = slugify(current_post.title)
            counter = 1
            new_slug = base_slug
            while BlogPostPage.objects.filter(slug=new_slug).exclude(id=current_post.id).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            current_post.slug = new_slug

    def upload_image(self, post, image):
        if post.cloudinary_image_id:
            uploader.delete_image(post.cloudinary_image_id)

        image_data = handle_image_upload(
            instance=post,
            uploader=uploader,
            image=image,
            folder=settings.POSTS_FOLDER,
        )

        if image_data:
            post.cloudinary_image_id = image_data.get("cloudinary_image_id")
            post.cloudinary_image_url = image_data.get("cloudinary_image_url")
            post.optimized_image_url = image_data.get("optimized_image_url")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        action_url = reverse_lazy(
            "blog:update_blog_post",
            kwargs={"slug": self.object.slug}
        )
        context.update({
            "title": "Update Blog Post",
            "submit_text": "Update Post",
            "action_url": action_url
        })
        return context
'''
