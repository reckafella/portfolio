from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import DeleteView
from django.http import JsonResponse

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
            "data_loading_text": "Deleting Post...",
            "extra_messages": [
                {
                    "text": "Are you sure you want to delete this post?",
                    "link": reverse_lazy("blog:list_articles"),
                    "link_text": "Cancel",
                }
            ],
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

        # Delete image from cloudinary if it exists
        if post.first_image and post.first_image.cloudinary_image_id:
            try:
                uploader.delete_image(post.first_image.cloudinary_image_id)
                success_messages.append("Success. Image Deleted.")
            except Exception as e:
                error_messages.append(f"Failed to delete image: {str(e)}")
                response = {
                    "success": False,
                    "errors": error_messages,
                }

                if is_ajax(self.request):
                    return JsonResponse(response, status=500)
            # delete the image model instance
            post.first_image.delete()
        # Delete the post
        try:
            post.delete()
            success_messages.append("Success. Post Deleted.")
        except Exception as e:
            error_messages.append(f"Failed to delete post: {str(e)}")
            response = {
                "success": False,
                "errors": error_messages,
            }

            if is_ajax(self.request):
                return JsonResponse(response, status_code=500)
        response = {
            "success": True,
            "messages": success_messages,
            "redirect_url": self.get_success_url(),
        }
        if is_ajax(request):
            return JsonResponse(response, status_code=200)
        return super().delete(request, *args, **kwargs)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        """Redirect to the the list of blog posts after deletion"""
        return self.success_url
