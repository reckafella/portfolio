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

            # Create a savepoint for potential rollback
            savepoint = transaction.savepoint()

            try:
                # Create and save the project
                project = form.save()
                project.title = titlecase(project.title)
                project.description = project.description.strip()
                project.project_url = project.project_url.strip()
                project.project_type = project.project_type
                project.live = project.live
                project.client = project.client
                project.save()

                success_messages = []
                error_messages = []
                media_success = False

                # Handle image upload if images are provided
                if images:
                    self.handle_images(images, project, success_messages,
                                       error_messages)
                    if not error_messages:  # Images uploaded successfully
                        media_success = True

                # Handle video URLs if provided
                if youtube_urls:
                    self.handle_youtube_urls(youtube_urls, project,
                                             success_messages, error_messages)

                    if not error_messages or (error_messages
                                              and media_success):
                        media_success = True

                # If no media was successfully processed, rollback
                if not media_success and (images or youtube_urls):
                    transaction.savepoint_rollback(savepoint)
                    error_message = "Failed to process any media files.\
                          Project creation cancelled."

                    if is_ajax(self.request):
                        return JsonResponse({
                            "success": False,
                            "errors": [error_message] + error_messages,
                            "messages": []
                        }, status=400)
                    else:
                        messages.error(self.request, error_message)
                        return self.form_invalid(form)

                # Commit the transaction
                transaction.savepoint_commit(savepoint)

                # Set appropriate success messages
                if media_success:
                    if images and youtube_urls:
                        _m = "Success. Project with images and videos Created!"
                        success_messages.append(_m)
                    elif images:
                        _m = "Success. Project and images uploaded!"
                        success_messages.append(_m)
                    elif youtube_urls:
                        _m = "Success. Project and videos added!"
                        success_messages.append(_m)

                # Add warning if some media failed but project still created
                if error_messages and media_success:
                    success_messages.append("Project created successfully,\
                                            but some media had issues.")

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

            except Exception as media_error:
                # Rollback the project creation if media handling fails
                transaction.savepoint_rollback(savepoint)
                raise media_error

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


'''from django.contrib import messages
from django.views.generic import CreateView
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

    def form_valid(self, form):
        """Handle successful form submission"""
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

            # Double-checking validation (already be caught by form.clean())
            if not images and not youtube_urls:
                error_message = "Provide at least one image or YouTube URL"
                if is_ajax(self.request):
                    return JsonResponse({
                        "success": False,
                        "errors": [error_message],
                        "messages": []
                    }, status=400)
                else:
                    messages.error(self.request, error_message)
                    return self.form_invalid(form)

            # Create and save the project
            project = form.save()
            project.title = titlecase(project.title)
            project.description = project.description.strip()
            project.project_url = project.project_url.strip()
            project.project_type = project.project_type
            project.live = project.live
            project.client = project.client
            project.save()

            success_messages = []
            error_messages = []

            # Handle image upload if images are provided
            if images:
                self.handle_images(images, project,
                                   success_messages, error_messages)

            # Handle video URLs if provided
            if youtube_urls:
                self.handle_youtube_urls(youtube_urls, project,
                                         success_messages, error_messages)

            # If we only have one type of media, add correct success message
            if images and not youtube_urls:
                if not error_messages:  # Only if no errors occurred
                    mess = "Project and images uploaded successfully!"
                    success_messages.append(mess)
            elif youtube_urls and not images:
                if not error_messages:  # Only if no errors occurred
                    mess = "Project and videos added successfully!"
                    success_messages.append(mess)
            elif images and youtube_urls:
                if not error_messages:  # Only if no errors occurred
                    mess = "Success Creating Project with images and videos!"
                    success_messages.append(mess)

            # If there were errors with media but project was created
            if error_messages:
                _m = "Project created successfully, but some media had issues."
                success_messages.append(_m)

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

            return super().form_valid(form)

        except Exception as e:
            # Handle any unexpected errors during project creation
            _e = str(e)
            error_message = f"An error occurred while creating project: {_e}"

            if is_ajax(self.request):
                return JsonResponse({
                    "success": False,
                    "errors": [error_message],
                    "messages": []
                }, status=500)
            else:
                messages.error(self.request, error_message)
                return self.form_invalid(form)


from django.contrib import messages
from django.views.generic import CreateView
from titlecase import titlecase
from django.http import JsonResponse

from app.views.helpers.helpers import handle_no_permissions, is_ajax
from .base import BaseProjectView


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
        project.project_type = project.project_type
        project.live = project.live
        project.client = project.client
        project.save()

        success_messages = []
        error_messages = []

        images = self.request.FILES.getlist('images', [])
        youtube_urls = form.cleaned_data.get("youtube_urls", [])

        # If no images or videos were provided,
        # add a success message for project creation
        if not images and not youtube_urls:
            success_messages.append("Project created successfully!")

        # Handle image upload if images are provided
        elif images:
            self.handle_images(images, project,
                               success_messages, error_messages)

        # Handle video URLs if provided
        elif youtube_urls:
            self.handle_youtube_urls(youtube_urls, project,
                                     success_messages, error_messages)

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
'''
