from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from django.utils.text import slugify
from titlecase import titlecase

from app.forms import CustomErrorList, ProjectsForm
from app.models import Projects
from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, is_ajax, return_response

uploader = CloudinaryImageHandler()


class UpdateProjectView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Projects
    form_class = ProjectsForm
    error_class = CustomErrorList
    template_name = "app/projects/create_or_update.html"
    context_object_name = "view"

    def form_valid(self, form):
        project = form.instance
        original_project = self.get_object()

        # Update fields
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        project.project_url = project.project_url.strip() if project.project_url else ""

        # Update slug if title changed
        if project.title != original_project.title:
            base_slug = slugify(project.title)
            counter = 1
            new_slug = base_slug
            while Projects.objects.filter(slug=new_slug).exclude(id=project.id).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            project.slug = new_slug

        image = form.files.get("image")

        # Handle authorization
        if not self.test_func():
            handle_no_permissions(
                self.request, "You do not have permission to update this project."
            )

        # Handle image upload
        if image:
            # Delete old image if it exists
            if project.cloudinary_image_id:
                uploader.delete_image(project.cloudinary_image_id)
                
            try:
                res = handle_image_upload(
                    project, uploader, image, settings.PROJECTS_FOLDER
                )
                if res:
                    project.cloudinary_image_id = res["cloudinary_image_id"]
                    project.cloudinary_image_url = res["cloudinary_image_url"]
                    project.optimized_image_url = res["optimized_image_url"]
            except Exception as e:
                # Delete the image from Cloudinary if an error occurs
                if project.cloudinary_image_id:
                    uploader.delete_image(project.cloudinary_image_id)
                response = {"success": False, "errors": f"An error occurred: {str(e)}"}
                if is_ajax(self.request):
                    return JsonResponse(response, status=400)
                form.add_error(None, f"An error occurred: {str(e)}")
                return return_response(self.request, response, 400)

        response = super().form_valid(form)

        if is_ajax(self.request):
            return JsonResponse({
                "success": True,
                'message': "Project updated successfully.",
                "redirect_url": self.get_success_url()
            })
        
        return response

    def test_func(self):
        """
        Check if the user is a staff or superuser.
        """
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_success_url(self):
        """
        Redirect to the project detail page after successfully updating the project.
        """
        return reverse_lazy("app:project_detail", kwargs={"slug": self.object.slug})

    def get_context_data(self, **kwargs):
        """
        Add additional context data for the template.
        """
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Update Project",
            "submit_text": "Update Project"
        })
        return context