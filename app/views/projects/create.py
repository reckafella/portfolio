from django.contrib import messages
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy as reverse
from django.views.generic import CreateView
from titlecase import titlecase
from django.http import JsonResponse

from authentication.forms.errors import CustomErrorList
from app.forms.projects import ProjectsForm
from app.models import Image, Projects, Video
from app.views.helpers.cloudinary import (
    CloudinaryImageHandler, handle_image_upload
)
from app.views.helpers.helpers import handle_no_permissions, is_ajax

uploader = CloudinaryImageHandler()


class BaseProjectView(LoginRequiredMixin, UserPassesTestMixin):
    model = Projects
    form_class = ProjectsForm
    error_class = CustomErrorList
    template_name = "app/projects/create_or_update.html"
    context_object_name = "view"

    def test_func(self):
        """ Allow only staff members/superusers to create projects """
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_success_url(self):
        """ Redirect to the project's details after a successful creation """
        return reverse("app:project_detail", kwargs={"slug": self.object.slug})

    def get_context_data(self, **kwargs):
        """ Get Context Data """
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Add a New Project",
            "submit_text": "Add Project",
            "data_loading_text": "Adding Project...",
        })
        return context

    def handle_image_error(self, instance, image_file_name, e):
        """ Handle Image Error """
        if instance.image_id:
            uploader.delete_image(instance.image_id)

        response = {
            "success": False,
            "errors": f'Error Uploading {image_file_name}: {str(e)}'
        }
        if is_ajax(self.request):
            return JsonResponse(response, status=400)
        return self.form_invalid(self.get_form(), response=response)

    def handle_image_success(self, image_file_name):
        """ Handle Image Success """
        response = {
            "success": True,
            "message": f"{image_file_name} uploaded successfully."
        }
        if is_ajax(self.request):
            return JsonResponse(response)
        return JsonResponse(response)

    def upload_image(self, instance, image):
        """ Upload Image """
        return handle_image_upload(
            instance=instance,
            uploader=uploader,
            image=image,
            folder=settings.PROJECTS_FOLDER
        )

    def handle_images(self, images, project, sm, em):
        for image in images:
            try:
                image_data = self.upload_image(project, image)
                Image.objects.create(
                    project=project,
                    cloudinary_image_id=image_data["cloudinary_image_id"],
                    cloudinary_image_url=image_data["cloudinary_image_url"],
                    optimized_image_url=image_data["optimized_image_url"]
                )
                sm.append(
                    f"Image: {image.name} Uploaded Successfully!"
                )
            except Exception as e:
                em.append(
                    f"Error Uploading '{image.name}': {str(e)}"
                )

    def handle_youtube_urls(self, youtube_urls, project,
                            success_messages, error_messages):
        for url in youtube_urls:
            try:
                Video.objects.create(
                    project=project,
                    youtube_url=url.strip()
                )
                success_messages.append(
                    f"Video URL for '{url}' added successfully"
                )
            except Exception as e:
                error_messages.append(
                    f"Error adding video URL: {str(e)}"
                )


class CreateProjectView(BaseProjectView, CreateView):
    def form_valid(self, form):
        if not self.test_func():
            handle_no_permissions(
                self.request, "Not permitted to create a project."
            )

        # Create and save the project
        project = form.save()
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        project.project_url = project.project_url.strip()
        project.save()

        success_messages = []
        error_messages = []

        # Handle image upload if images are provided
        images = self.request.FILES.getlist('images', [])
        if images:
            self.handle_images(images, project,
                               success_messages, error_messages)

        # Handle video URLs if provided
        youtube_urls = form.cleaned_data.get("youtube_urls", [])
        if youtube_urls:
            self.handle_youtube_urls(youtube_urls, project,
                                     success_messages, error_messages)

        # If no images or videos were provided,
        # add a success message for project creation
        if not images and not youtube_urls:
            success_messages.append("Project created successfully!")

        response = super().form_valid(form)
        # Project creation is successful even if media upload fails
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": error_messages,
            "redirect_url": self.get_success_url(),
        }

        if is_ajax(self.request):
            return JsonResponse(response_data)

        # Add messages for non-AJAX requests
        if error_messages:
            for error in error_messages:
                messages.error(self.request, error)
        for message in success_messages:
            messages.success(self.request, message)

        return response
