from django.contrib import messages
from django.views.generic import CreateView
from django.db import transaction
from titlecase import titlecase
from django.http import JsonResponse

from app.views.helpers.helpers import handle_no_permissions, is_ajax
from .base import BaseProjectView


class CreateProjectView(BaseProjectView, CreateView):

    def get_form_kwargs(self):
        """Pass the request object to the form"""
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs

    @transaction.atomic
    def form_valid(self, form):
        """Handle successful form submission with database transaction"""
        if not self.test_func():
            if is_ajax(self.request):
                return JsonResponse({
                    "success": False,
                    "errors": ["Not permitted to create a project."],
                    "messages": []
                }, status=403)
            else:
                handle_no_permissions(
                    self.request, "Not permitted to create a project."
                )

        try:
            # Get media data before creating project
            images = self.request.FILES.getlist('images', [])
            youtube_urls = form.cleaned_data.get("youtube_urls", [])

            # Create and save the project first
            project = form.save()
            project.title = titlecase(project.title)
            project.description = project.description.strip()
            project.project_url = project.project_url.strip()
            project.project_type = project.project_type
            project.live = project.live
            project.client = project.client
            project.save()

            # Set self.object to ensure get_success_url() works properly
            self.object = project

            success_messages = []
            error_messages = []
            media_success = True  # Assume success initially

            # Handle image upload if images are provided
            if images:
                try:
                    self.handle_images(images, project, success_messages,
                                       error_messages)
                except Exception as img_error:
                    err_msg = f"Image upload failed: {str(img_error)}"
                    error_messages.append(err_msg)
                    media_success = False

            # Handle video URLs if provided
            if youtube_urls:
                try:
                    self.handle_youtube_urls(youtube_urls, project,
                                             success_messages, error_messages)
                except Exception as vid_error:
                    err_msg = f"Video processing failed: {str(vid_error)}"
                    error_messages.append(err_msg)
                    media_success = False

            # Set appropriate success messages
            if not images and not youtube_urls:
                success_messages.append("Project created successfully!")
            elif media_success and not error_messages:
                if images and youtube_urls:
                    success_messages.append(
                        "Success. Project with images and videos created!")
                elif images:
                    success_messages.append(
                        "Success. Project and images uploaded!")
                elif youtube_urls:
                    success_messages.append(
                        "Success. Project and videos added!")
            elif error_messages:
                success_messages.append(
                    "Project created successfully, but some media had issues.")

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
                    messages.warning(self.request, error)
            for message in success_messages:
                messages.success(self.request, message)

            return super().form_valid(form)

        except Exception as e:
            _e = str(e)
            error_mes = f"An error occurred while creating the project: {_e}"

            if is_ajax(self.request):
                return JsonResponse({
                    "success": False,
                    "errors": [error_mes],
                    "messages": []
                }, status=500)
            else:
                messages.error(self.request, error_mes)
                return self.form_invalid(form)
