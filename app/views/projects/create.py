from django.contrib import messages
from django.db import transaction
from django.http import JsonResponse
from django.views.generic import CreateView
from titlecase import titlecase

from app.views.helpers.helpers import handle_no_permissions, is_ajax

from .base import BaseProjectView


class CreateProjectView(BaseProjectView, CreateView):

    def get_form_kwargs(self):
        """Pass the request object to the form"""
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs

    def _check_permissions(self):
        """Check if user has permission to create project"""
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
        return None

    def _create_and_save_project(self, form):
        """Create and save the project with cleaned data"""
        project = form.save()
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        project.project_url = project.project_url.strip()
        project.project_type = project.project_type
        project.live = project.live
        project.client = project.client
        project.save()
        return project

    def _process_media(self, images, youtube_urls, project):
        """Process images and videos for the project"""
        success_messages = []
        error_messages = []
        media_success = True

        # Handle image upload if images are provided
        if images:
            try:
                self.handle_images(
                    images, project, success_messages, error_messages)
            except Exception as img_error:
                err_msg = f"Image upload failed: {str(img_error)}"
                error_messages.append(err_msg)
                media_success = False

        # Handle video URLs if provided
        if youtube_urls:
            try:
                self.handle_youtube_urls(
                    youtube_urls, project, success_messages, error_messages)
            except Exception as vid_error:
                err_msg = f"Video processing failed: {str(vid_error)}"
                error_messages.append(err_msg)
                media_success = False

        return success_messages, error_messages, media_success

    def _generate_success_messages(
            self,
            images,
            youtube_urls,
            media_success,
            error_messages):
        """Generate appropriate success messages based on media processing results"""
        success_messages = []

        if not images and not youtube_urls:
            success_messages.append("Project created successfully!")
        elif media_success and not error_messages:
            if images and youtube_urls:
                success_messages.append(
                    "Success. Project with images and videos created!")
            elif images:
                success_messages.append("Success. Project and images uploaded!")
            elif youtube_urls:
                success_messages.append("Success. Project and videos added!")
        elif error_messages:
            success_messages.append(
                "Project created successfully, but some media had issues.")

        return success_messages

    def _handle_response(self, success_messages, error_messages, form):
        """Handle the response for both AJAX and non-AJAX requests"""
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

    @transaction.atomic
    def form_valid(self, form):
        """Handle successful form submission with database transaction"""
        permission_check = self._check_permissions()
        if permission_check:
            return permission_check

        try:
            # Get media data before creating project
            images = self.request.FILES.getlist('images', [])
            youtube_urls = form.cleaned_data.get("youtube_urls", [])

            # Create and save the project first
            project = self._create_and_save_project(form)
            self.object = project

            # Process media files
            success_messages, error_messages, media_success = self._process_media(
                images, youtube_urls, project)

            # Generate final success messages
            final_messages = self._generate_success_messages(
                images, youtube_urls, media_success, error_messages
            )
            success_messages.extend(final_messages)

            return self._handle_response(success_messages, error_messages, form)

        except Exception as e:
            error_mes = f"An error occurred while creating the project: {
                str(e)}"

            if is_ajax(self.request):
                return JsonResponse({
                    "success": False,
                    "errors": [error_mes],
                    "messages": []
                }, status=500)
            else:
                messages.error(self.request, error_mes)
                return self.form_invalid(form)
