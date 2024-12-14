from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView
from titlecase import titlecase

from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions
from blog.models import BlogPostPage, BlogIndexPage
from blog.forms import BlogPostForm
from portfolio import settings
from app.views.helpers.helpers import is_ajax

uploader = CloudinaryImageHandler()


class CreatePostView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/create_post.html"
    context_object_name = "view"

    def form_valid(self, form):
        # Set the author and title
        post = form.instance
        post.author = self.request.user
        post.title = titlecase(post.title)
        cover_image = form.files.get("cover_image")

        # Authorization check
        if not self.test_func():
            handle_no_permissions(self.request, "Not allowed to create a blog post.")

        # Separate image upload from form validation
        try:
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
                    if is_ajax(self.request):
                        return self.form_invalid(form, response)
                    return self.form_invalid(form, response)

            parent_page = BlogIndexPage.objects.first()  # Or filter as needed
            if not parent_page:
                response = {"success": False, "errors": "No parent page (BlogIndexPage) found."}
                return JsonResponse(response, status=400)

            # Add the new page as a child of the parent page
            parent_page.add_child(instance=post)
            response = super().form_valid(form)

            if is_ajax(self.request):
                return JsonResponse({
                    "success": True,
                    "message": "Post created successfully",
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
                errors = {field: form.errors[field] for field in form.errors}
            return JsonResponse({
                "success": False,
                "errors": errors
            }, status=400)
        return super().form_invalid(form)

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
