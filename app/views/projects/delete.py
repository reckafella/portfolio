from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DeleteView
from django.db import transaction
from django.db.models.deletion import ProtectedError

from app.models import Projects
from app.views.helpers.cloudinary import CloudinaryImageHandler
from app.views.helpers.helpers import is_ajax

uploader = CloudinaryImageHandler()


class DeleteProjectView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Projects
    template_name = "app/projects/deletion/confirm_delete.html"
    context_object_name = "view"
    success_url = reverse_lazy("app:projects")
    login_url = reverse_lazy("authentication:login")
    redirect_field_name = "next"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Delete Project",
            "form_title": "Delete Project",
            "submit_text": "Delete Project",
            "cancel_text": "Cancel",
            "data_loading_text": "Deleting Project...",
        })
        return context

    def test_func(self):
        return self.request.user.is_staff

    def post(self, request, *args, **kwargs):
        """
        Override post instead of delete to properly handle the protected\
            relationships
        """
        self.object = self.get_object()
        self.object_id = self.object.pk
        project = self.object
        success_messages = []
        error_messages = []

        try:
            with transaction.atomic():
                # 1. Delete ALL images first (they are protected)
                images = list(project.images.all())
                for image in images:
                    try:
                        if image.cloudinary_image_id:
                            uploader.delete_image(image.cloudinary_image_id)
                        image.delete()
                        success_messages.append("Deleted image successfully.")
                    except Exception as e:
                        _message = f"Failed to delete image: {str(e)}"
                        error_messages.append(_message)
                        raise

                # 2. Delete ALL videos (they are protected)
                videos = list(project.videos.all())
                for video in videos:
                    try:
                        video.delete()
                        _message = "Deleted video link successfully."
                        success_messages.append(_message)
                    except Exception as e:
                        _message = f"Failed to delete video link: {str(e)}"
                        error_messages.append(_message)
                        raise

                # 3. Only after ALL protected relations are deleted,\
                # delete the project
                try:
                    project.delete()
                    success_messages.append("Project deleted successfully!")
                except ProtectedError as pe:
                    # If we still get a protected error,\
                    # show the remaining protected objects
                    protected_objects = list(pe.protected_objects)
                    protected_details = [f"{obj.__class__.__name__}\
                                         (ID: {obj.pk})"
                                         for obj in protected_objects]

                    error_message = f"Cannot delete project because it's still\
                        referenced by {len(protected_objects)} objects:\
                            {', '.join(protected_details)}"
                    error_messages.append(error_message)
                    raise
                except Exception as e:
                    _message = f"Failed to delete project: {str(e)}"
                    error_messages.append(_message)
                    raise

        except Exception as e:
            # If any error occurs, rollback and return the error response
            error_messages = list(set(error_messages))
            error_messages.append(str(e))
            response_data = {
                "success": False,
                "messages": success_messages,
                "errors": error_messages,
                "redirect_url": None,
            }

            if is_ajax(request):
                return JsonResponse(response_data, status=400)

            for error in error_messages if error_messages else [str(e)]:
                messages.error(request, error)
            return self.render_to_response(self.get_context_data())

        # If everything succeeded
        response_data = {
            "success": True,
            "messages": success_messages,
            "redirect_url": self.get_success_url(),
        }

        for message in success_messages:
            messages.success(request, message)

        if is_ajax(request):
            return JsonResponse(response_data, status=200)

        return self.render_to_response(self.get_context_data())

    def get_success_url(self):
        """
        Override get_success_url to redirect to the success URL
        """
        return self.success_url
