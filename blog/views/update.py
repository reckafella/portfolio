from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, is_ajax, return_response
from blog.models import BlogPostPage
from blog.forms import BlogPostForm
from portfolio import settings


uploader = CloudinaryImageHandler()


class UpdatePostView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_post.html"

    def form_valid(self, form):
        cover_image = form.files.get("cover_image")
        post = form.instance
        post.title = titlecase(post.title)

        # Authorization check
        if not self.test_func():
            handle_no_permissions(self.request, "Not Allowed to edit this post.")

        # Delete the old image from Cloudinary if a new image is being uploaded
        if cover_image and post.cloudinary_image_id:
            uploader.delete_image(post.cloudinary_image_id)

        # Upload new image to cloudinary
        if cover_image:
            try:
                image = handle_image_upload(
                    instance=post,
                    uploader=uploader,
                    image=cover_image,
                    folder=settings.POSTS_FOLDER,
                )

                if image:
                    post.cloudinary_image_id = image["public_id"]
                    post.cloudinary_image_url = image["secure_url"]
                    post.optimized_image_url = uploader.get_optim_url(
                        image["public_id"]
                    )

            except Exception as e:
                errors = ", ".join(e) if isinstance(e, list) else str(e)
                response = {"success": False, "errors": errors}
                form.add_error(None, errors)
                if is_ajax(self.request):
                    return return_response(self.request, response, 400)
                return return_response(self.request, response, 400)

        return super().form_valid(form)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        return reverse_lazy("blog:post_detail", kwargs={"slug": self.object.slug})

    def form_invalid(self, form, error=None):
        if error:
            form.add_error(None, error)
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"Edit Post: {self.object.title}"
        return context
