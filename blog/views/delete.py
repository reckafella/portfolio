from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import DeleteView

from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import handle_no_permissions, return_response
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

    def delete(self, request, *args, **kwargs):
        post = self.get_object()

        # Authorization check
        if not self.test_func():
            handle_no_permissions(self.request, "Not Authorized to delete this post")

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

    def get_success_url(self):
        """Redirect to the the list of blog posts after deletion"""
        return self.success_url
