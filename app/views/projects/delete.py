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
    login_url = reverse_lazy("app:login")
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

    def delete(self, request, **_):
        project = self.get_object()
        success_messages = []
        error_messages = []

        try:
            with transaction.atomic():
                # 1. Delete images from Cloudinary and database
                images = list(project.images.all())
                for image in images:
                    try:
                        if image.cloudinary_image_id:
                            uploader.delete_image(image.cloudinary_image_id)  # Fixed typo here
                        image.delete()
                        success_messages.append("Delete Image Success...")
                    except Exception as e:
                        error_messages.append(f"Delete Image Failed: {str(e)}")
                        raise Exception(f"Error deleting image: {str(e)}")

                # 2. Delete video records
                videos = list(project.videos.all())
                for video in videos:
                    try:
                        video.delete()
                        success_messages.append("Success: Video link removed.")
                    except Exception as e:
                        error_messages.append(
                            f"Video link deletion failed: {str(e)}"
                        )
                        raise Exception(f"Error removing video: {str(e)}")

                # 3. Finally delete the project
                try:
                    project.delete()
                    success_messages.append("Project deleted successfully!")
                except ProtectedError as e:
                    # Extract the protected objects from the error
                    protected_objects = list(e.protected_objects)
                    protected_details = [f"{obj.__class__.__name__} (ID: {obj.pk})" for obj in protected_objects]
                    
                    error_message = f"Cannot delete project because it's still referenced by {len(protected_objects)} objects: {', '.join(protected_details)}"
                    error_messages.append(error_message)
                    raise Exception(error_message)

        except Exception as e:
            transaction.set_rollback(True)  # Ensure transaction is rolled back
            error_messages.append(f"Error during deletion process: {str(e)}")
            response_data = {
                "success": False,
                "messages": success_messages,
                "errors": error_messages,
                "redirect_url": None,
            }

            if is_ajax(request):
                return JsonResponse(response_data, status=400)

            for error in error_messages:
                messages.error(request, error)
            return self.render_to_response(self.get_context_data())

        # If everything succeeded
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": [],
            "redirect_url": self.get_success_url(),
        }

        if is_ajax(request):
            return JsonResponse(response_data)

        for message in success_messages:
            messages.success(request, message)

        return self.render_to_response(self.get_context_data())


""" from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DeleteView
from django.db import transaction

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

    def delete(self, request, **_):
        project = self.get_object()
        success_messages = []
        error_messages = []

        try:
            with transaction.atomic():
                # 1. Delete images from Cloudinary and database
                images = list(project.images.all())
                for image in images:
                    try:
                        if image.cloudinary_image_id:
                            uploader.delete_image(image.cloudinary_image_id)
                        image.delete()
                        success_messages.append("Delete Image Success...")
                    except Exception as e:
                        error_messages.append(f"Delete Image Failed: {str(e)}")
                        raise Exception(f"Error deleting image: {str(e)}")

                # 2. Delete video records
                videos = list(project.videos.all())
                for video in videos:
                    try:
                        video.delete()
                        success_messages.append("Success: Video link removed.")
                    except Exception as e:
                        error_messages.append(
                            f"video link deletion failed: {str(e)}"
                        )
                        raise Exception(f"Error removing video: {str(e)}")

                # 3. Finally delete the project
                project.delete()
                success_messages.append("Project deleted successfully!")

        except Exception as e:
            error_messages.append(f"Error during deletion process: {str(e)}")
            response_data = {
                "success": False,
                "messages": success_messages,
                "errors": error_messages,
                "redirect_url": None,
            }

            if is_ajax(request):
                return JsonResponse(response_data, status=400)

            for error in error_messages:
                messages.error(request, error)
            return self.render_to_response(self.get_context_data())

        # If everything succeeded
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": [],
            "redirect_url": self.get_success_url(),
        }

        if is_ajax(request):
            return JsonResponse(response_data)

        for message in success_messages:
            messages.success(request, message)

        return self.render_to_response(self.get_context_data())
 """
