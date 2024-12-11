from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, return_response
from blog.models import BlogPostPage
from blog.forms import BlogPostForm
from portfolio import settings


uploader = CloudinaryImageHandler()


class CreatePostView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_post.html"
    context_object_name = "view"

    def form_valid(self, form):
        # Set the author and title
        post = post
        post.author = self.request.user
        post.title = titlecase(post.title)
        cover_image = form.files.get("cover_image")

        # Authorization check
        if not self.test_func():
            handle_no_permissions(self.request, "Not allowed to create a blog post.")

        # Separate image upload from form validation
        if cover_image:
            try:
                image_data = handle_image_upload(
                    instance=post,
                    uploader=uploader,
                    image=cover_image,
                    folder=settings.POSTS_FOLDER,
                )

                if image_data:
                    post.cloudinary_image_id = image_data["cloudinary_image_id"]
                    post.cloudinary_image_url = image_data["cloudinary_image_url"]
                    post.optimized_image_url = image_data["optimized_image_url"]

            except Exception as e:
                # Delete the post if an error occurs
                BlogPostPage.delete(post, using="default")
                # Delete the image from Cloudinary if an error occurs
                if post.cloudinary_image_id:
                    uploader.delete_image(post.cloudinary_image_id)
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
