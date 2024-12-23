from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from titlecase import titlecase
from django.http import JsonResponse
from django.db import transaction
from django.utils.text import slugify

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostPage
from blog.forms import BlogPostForm
from portfolio import settings


uploader = CloudinaryImageHandler()


class UpdatePostView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_or_update_post.html"
    context_object_name = "view"

    def form_valid(self, form):
        try:
            with transaction.atomic():
                post = form.instance
                original_post = self.get_object()
                
                # Check if title has changed
                if post.title != original_post.title:
                    post.title = titlecase(post.title)
                    # Generate new slug from title
                    base_slug = slugify(post.title)
                    
                    # Check if the new slug already exists
                    counter = 1
                    new_slug = base_slug
                    while BlogPostPage.objects.filter(slug=new_slug).exclude(id=post.id).exists():
                        new_slug = f"{base_slug}-{counter}"
                        counter += 1
                    
                    post.slug = new_slug
                
                post.author = self.request.user
                
                # Authorization check
                if not self.test_func():
                    handle_no_permissions(self.request, "Not Allowed to edit this post.")

                cover_image = form.files.get("cover_image")
                
                # Handle image upload if present
                if cover_image:
                    try:
                        # Delete old image first
                        if post.cloudinary_image_id:
                            uploader.delete_image(post.cloudinary_image_id)
                            
                        image_data = handle_image_upload(
                            instance=post,
                            uploader=uploader,
                            image=cover_image,
                            folder=settings.POSTS_FOLDER,
                        )

                        if image_data:
                            post.cloudinary_image_id = image_data.get("cloudinary_image_id")
                            post.cloudinary_image_url = image_data.get("cloudinary_image_url")
                            post.optimized_image_url = image_data.get("optimized_image_url")
                    
                    except Exception as e:
                        errors = ", ".join(e) if isinstance(e, list) else str(e)
                        response = {"success": False, "errors": errors}
                        form.add_error(None, errors)
                        return self.form_invalid(form, response)

                # Save the form
                response = super().form_valid(form)
                
                if is_ajax(self.request):
                    return JsonResponse({
                        "success": True,
                        "message": "Post updated successfully",
                        "redirect_url": self.get_success_url()
                    })
                return response

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
        # Use the updated slug for redirection
        return reverse_lazy(
            "blog:blog_post_details",
            kwargs={"slug": self.object.slug}
        )

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
