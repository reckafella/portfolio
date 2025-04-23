from django.contrib import messages
# from django.conf import settings
from django.http import JsonResponse
from django.views.generic import UpdateView
from titlecase import titlecase

# from app.models import Image, Video
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
            self.handle_images(images, project,
                               success_messages, error_messages)

        if youtube_urls:
            # First, delete existing videos if you want to replace them
            # Video.objects.filter(project=project).delete()
            # Create new video objects
            self.handle_youtube_urls(youtube_urls, project,
                                     success_messages, error_messages)

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
