from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView
from titlecase import titlecase

from app.forms import ProjectsForm
from app.models import Projects
from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions, return_response

uploader = CloudinaryImageHandler()


class CreateProjectView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/create_or_update.html"
    context_object_name = "view"

    def form_valid(self, form):
        project = form.instance
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        image = form.files.get("image")

        # Handle authorization
        if not self.test_func():
            handle_no_permissions(
                self.request, "You do not have permission to create a project."
            )

        # Handle image upload
        try:
            res: dict = handle_image_upload(
                project, uploader, image, settings.PROJECTS_FOLDER
            )
            if res:
                project.cloudinary_image_id = res["cloudinary_image_id"]
                project.cloudinary_image_url = res["cloudinary_image_url"]
                project.optimized_image_url = res["optimized_image_url"]
        except Exception as e:
            # Delete the project if an error occurs
            Projects.delete(project, using="default")
            # Delete the image from Cloudinary if an error occurs
            if project.cloudinary_image_id:
                uploader.delete_image(project.cloudinary_image_id)
            response = {"success": False, "errors": f"An error occurred: {str(e)}"}
            form.add_error(None, f"An error occurred: {str(e)}")
            return return_response(self.request, response, 400)

        return super().form_valid(form)

    def test_func(self):
        # Allow only staff members/superusers to create projects
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_success_url(self):
        # Redirect to the project's details after a successful creation
        return reverse_lazy("app:project_detail", kwargs={"pk": self.object.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({"title": "Add a New Project", "submit_text": "Add Project"})
        return context
