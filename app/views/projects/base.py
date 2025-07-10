from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy as reverse
from django.http import JsonResponse

from authentication.forms.errors import CustomErrorList
from app.forms.projects import ProjectsForm
from app.models import Image, Projects, Video
from app.views.helpers.cloudinary import (
    CloudinaryImageHandler, handle_image_upload
)
from app.views.helpers.helpers import is_ajax

uploader = CloudinaryImageHandler()


class BaseProjectView(LoginRequiredMixin, UserPassesTestMixin):
    model = Projects
    form_class = ProjectsForm
    error_class = CustomErrorList
    template_name = "app/projects/create_or_update.html"
    context_object_name = "view"

    def form_invalid(self, form):
        """Handle form validation errors, especially for AJAX requests"""
        if is_ajax(self.request):
            # Collect all form errors
            error_messages = []

            # Field-specific errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            # Non-field errors (from clean() method)
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                "success": False,
                "errors": error_messages,
                "messages": [],
                "form_errors": form.errors.get_json_data()
            }, status=400)

        # For non-AJAX requests, use default behavior
        return super().form_invalid(form)

    def test_func(self):
        """ Allow only staff members/superusers to create projects """
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_success_url(self):
        """ Redirect to the project's details after a successful creation """
        if hasattr(self, 'object') and self.object and self.object.slug:
            kwargs = {"slug": self.object.slug}
            return reverse("app:project_details", kwargs=kwargs)
        return reverse("app:projects")

    def get_context_data(self, **kwargs):
        """ Get Context Data """
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Create Project",
            "submit_text": "Create Project",
            "data_loading_text": "Creating Project",
            "form_id": "create-project-form",
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
