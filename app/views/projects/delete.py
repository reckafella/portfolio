from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DeleteView

from app.models import Projects
from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import is_ajax

uploader = CloudinaryImageHandler()


class DeleteProjectView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Projects
    template_name = "app/projects/deletion/confirm_delete.html"
    context_object_name = "view"
    success_url = reverse_lazy("app:projects")
    login_url = reverse_lazy("app:login")
    redirect_field_name = "next"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "page_title": "Delete Project",
                "form_title": "Delete Project",
                "submit_text": "Delete Project",
                "cancel_text": "Cancel",
            }
        )
        return context

    def test_func(self):
        return self.request.user.is_staff

    def delete(self, request, *args, **kwargs):
        project = self.get_object()

        if project.cloudinary_image_id:
            try:
                uploader.delete_image(project.cloudinary_image_id)
            except Exception as e:
                if is_ajax(request):
                    return JsonResponse(
                        {"success": False, "errors": f"Error Deleting Image: {str(e)}"},
                        status=500,
                    )

        return super().delete(request, *args, **kwargs)
