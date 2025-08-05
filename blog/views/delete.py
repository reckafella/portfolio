from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import DeleteView
from django.http import HttpResponseRedirect, JsonResponse
from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.contrib import messages

from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from blog.models import BlogPostPage

uploader = CloudinaryImageHandler()


class DeletePostView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = BlogPostPage
    template_name = "blog/deletion/confirm_delete.html"
    success_url = reverse_lazy("blog:list_articles")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Delete Post",
            "submit_text": "Delete",
            "data_loading_text": "Deleting Post",
            "extra_messages": [
                {
                    "text": "Are you sure you want to delete this post?",
                    "link": reverse_lazy("blog:list_articles"),
                    "link_text": "Cancel",
                }
            ],
            "form_id": "delete-post-form",
        })

        return context

    def post(self, request, *args, **kwargs):
        post = self.get_object()
        error_messages = []
        success_messages = []

        # Authorization check
        if not self.test_func():
            handle_no_permissions(self.request,
                                  "Not Authorized to delete this post")

        # Delete all images associated with the post
        try:
            with transaction.atomic():
                images = list(post.images.all())
                for image in images:
                    try:
                        if image.cloudinary_image_id:
                            uploader.delete_image(image.cloudinary_image_id)
                        image.delete()
                        success_messages.append("Success. Image Deleted.")
                    except Exception as e:
                        error_messages.append(
                            f"Failed to delete image: {str(e)}")
                try:
                    post_title = post.title
                    post.delete()
                    success_messages.append(
                        f"Success. Post '{post_title}' Deleted.")
                except ProtectedError as pe:
                    # If post has protected relationships, handle it gracefully
                    protected_objects = list(pe.protected_objects)
                    protected_details = [f"{obj.__class__.__name__}\
                                         (ID: {obj.pk})"
                                         for obj in protected_objects]

                    error_message = (f"Failed. Blog Post still referenced by "
                                     f"{len(protected_objects)} objects:\
                                        {', '.join(protected_details)}")
                    error_messages.append(error_message)
                    raise
                except Exception as e:
                    error_messages.append(f"Failed to delete post: {str(e)}")
                    response = {
                        "success": False,
                        "errors": error_messages,
                    }
                    if is_ajax(request):
                        return JsonResponse(response, status=500)
        except Exception as e:
            # If any error occurs, rollback and return the error response
            error_messages = list(set(error_messages))
            if str(e) not in error_messages:
                error_messages.append(str(e))

            response_data = {
                "success": False,
                "messages": success_messages,
                "errors": error_messages,
                "redirect_url": None,
            }

            if is_ajax(request):
                return JsonResponse(response_data, status=400)

            # Add error messages for non-AJAX requests
            for error in error_messages:
                messages.error(request, error)
            return self.render_to_response(self.get_context_data())

        response = {
            "success": True,
            "messages": success_messages,
            "errors": [],
            "redirect_url": self.get_success_url(),
        }
        if is_ajax(request):
            return JsonResponse(response, status_code=200)

        # For non-AJAX requests, add success messages
        for message in success_messages:
            messages.success(request, message)

        return HttpResponseRedirect(self.get_success_url())

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        """Redirect to the the list of blog posts after deletion"""
        return self.success_url
