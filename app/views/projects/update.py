from django.contrib import messages
from django.conf import settings
from django.http import JsonResponse
from django.views.generic import UpdateView
from titlecase import titlecase

from app.models import Image, Video
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from app.views.projects.create import BaseProjectView


class UpdateProjectView(BaseProjectView, UpdateView):
    def form_valid(self, form):
        project = form.save()
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        project.project_url = project.project_url.strip()
        project.project_type = project.project_type
        project.live = project.live
        project.client = project.client
        project.youtube_urls = project.youtube_urls
        project.save()

        images = self.request.FILES.getlist('images', [])
        youtube_urls = form.cleaned_data.get("youtube_urls", [])

        # Handle authorization
        if not self.test_func():
            handle_no_permissions(
                self.request, "You do not have permission to update a project."
            )
        
        success_messages = []
        error_messages = []

        # Handle image upload
        if images:
            self.handle_images(images, project, success_messages, error_messages)

        if youtube_urls:
            # First, delete existing videos if you want to replace them
            Video.objects.filter(project=project).delete()
            
            # Create new video objects
            self.handle_youtube_urls(youtube_urls, project, success_messages, error_messages)

        if not images and not youtube_urls:
            success_messages.append("Project Updated Successfully!")

        response = super().form_valid(form)
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": error_messages,
            "redirect_url": self.get_success_url(),
        }

        if is_ajax(self.request):
            return JsonResponse(response_data)

        if error_messages:
            for error in error_messages:
                messages.error(self.request, error)
        for message in success_messages:
            messages.success(self.request, message)

        return response

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "title": "Update Project",
            "submit_text": "Update Project",
            "data_loading_text": "Updating Project...",
        })
        return context


'''
class UpdateProjectView(BaseProjectView, UpdateView):
    def form_valid(self, form):
        project = form.save()
        project.title = titlecase(project.title)
        project.description = project.description.strip()
        project.project_url = project.project_url.strip()
        images = self.request.FILES.getlist('images')
        youtube_urls = form.cleaned_data["youtube_urls"]

        # Handle authorization
        if not self.test_func():
            handle_no_permissions(
                self.request, "You do not have permission to create a project."
            )
        
        success_messages = []
        error_messages = []

        project.save()
        # Handle image upload
        if images:
            for image in images:
                try:
                    image_data = self.upload_image(project, image)
                    Image.objects.update(
                        project=project,
                        cloudinary_image_id=image_data["cloudinary_image_id"],
                        cloudinary_image_url=image_data["cloudinary_image_url"],
                        optimized_image_url=image_data["optimized_image_url"]
                    )
                    success_messages.append(
                        f"Image: {image.name} Uploaded Successfully!"
                    )
                except Exception as e:
                    error_messages.append(
                        f"Error Uploading '{image.name}': {str(e)}"
                    )

        if youtube_urls:
            for url in youtube_urls:
                try:
                    Video.objects.update(
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

        response = super().form_valid(form)
        response_data = {
            "success": len(error_messages) == 0,
            "messages": success_messages,
            "errors": error_messages,
            "redirect_url": self.get_success_url(),
        }

        if is_ajax(self.request):
            return JsonResponse(response_data)

        if error_messages:
            for error in error_messages:
                messages.error(self.request, error)
        for message in success_messages:
            messages.success(self.request, message)

        return response

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

'''
