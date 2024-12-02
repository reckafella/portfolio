from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.http import JsonResponse
from django.conf import settings
from django.urls import reverse_lazy
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    ListView,
    UpdateView,
)
from titlecase import titlecase

from app.forms import ProjectsForm
from app.models import Projects
from app.views.helpers.cloudinary import CloudinaryImageHandler

uploader = CloudinaryImageHandler()


class CreateProjectView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/add_project.html"
    context_object_name = "view"
    success_url = reverse_lazy("app:projects")
    login_url = reverse_lazy("app:login")
    redirect_field_name = "next"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cloudinary_handler = CloudinaryImageHandler()
        self.uploaded_image_public_id = None

    def form_valid(self, form):
        # Preprocess form data
        form.instance.title = titlecase(form.instance.title)
        form.instance.description = form.instance.description.strip()

        # Check permissions first
        if not self.test_func():
            return self.handle_no_permission()

        try:
            # Start a database transaction to ensure atomic operations
            with transaction.atomic():
                # Upload image to Cloudinary if it exists
                image = form.files.get("image")
                if image:
                    # Generate a unique public ID for the image
                    public_id = uploader.get_public_id()

                    # Upload the image
                    image_data = self.cloudinary_handler.upload_image(
                        image,
                        folder=settings.PROJECTS_FOLDER,
                        public_id=public_id,
                        overwrite=True,
                    )

                    # Store the public ID in case we need to delete it
                    self.uploaded_image_public_id = image_data["public_id"]

                    # Set Cloudinary image details
                    form.instance.cloudinary_image_id = image_data["public_id"]
                    form.instance.cloudinary_image_url = image_data["url"]
                    form.instance.optimized_image_url = uploader.get_optim_url(
                        image_data["public_id"]
                    )

                # Save the form
                response = super().form_valid(form)
                return response

        except Exception as e:
            # If an image was uploaded, delete it
            if self.uploaded_image_public_id:
                try:
                    self.cloudinary_handler.delete_image(self.uploaded_image_public_id)
                except Exception as cleanup_error:
                    # Log the cleanup error
                    print(f"Failed to delete Cloudinary image: {cleanup_error}")

            # Handle error response
            if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({"success": False, "errors": f"str(e)"}, status=500)

            # For non-AJAX requests
            form.add_error(None, str(e))
            return self.form_invalid(form)

    def form_invalid(self, form):
        # For AJAX requests, return JSON error response
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {"success": False, "errors": f"{form.errors}"}, status=400
            )

        # For non-AJAX requests, use default behavior
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "page_title": "Add a New Project",
                "form_title": "Add Project",
                "submit_text": "Add Project",
            }
        )
        return context

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return self.handle_no_authentication()

        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "You are not authorized to add a project",
                },
                status=403,
            )

        raise PermissionDenied("You are not authorized to add a project")

    def handle_no_authentication(self):
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "Please log in to continue",
                    "redirect_url": f"{self.login_url}?{self.redirect_field_name}={self.request.path}",
                },
                status=401,
            )

        return redirect_to_login(
            self.request.get_full_path(), self.login_url, self.redirect_field_name
        )


class ProjectListView(ListView):
    model = Projects
    template_name = "app/projects/projects.html"
    context_object_name = "projects"
    paginate_by = 6

    def get_queryset(self):
        projects = Projects.objects.all().order_by("-created_at")
        return projects

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Projects"
        context["form_title"] = "Projects"
        context["projects"] = context["projects"]
        return context


class ProjectDetailView(DetailView):
    model = Projects
    template_name = "app/projects/project_detail.html"
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()

        # Fetch related projects (random selection)
        context["related_projects"] = Projects.objects.exclude(id=project.id).order_by(
            "?"
        )[
            :3
        ]  # Get 3 random related projects

        # Additional context for page metadata
        context["page_title"] = project.title
        context["form_title"] = "Project Details"

        return context


""" class UpdateProjectView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Projects
    form_class = ProjectsForm
    template_name = 'app/projects/add_project.html'
    context_object_name = 'view'
    success_url = reverse_lazy('app:projects')
    login_url = reverse_lazy('app:login')
    redirect_field_name = 'next'

    def form_valid(self, form):
        form.instance.title = titlecase(form.instance.title)
        form.instance.description = form.instance.description.strip()
        if not self.test_func():
            return self.handle_no_permission()

        # Upload image to Cloudinary if it exists
        image = form.files.get('image')
        if image:
            try:
                image_data = uploader.upload_image(
                    image,
                    folder='portfolio/projects',
                    public_id=uploader.get_public_id(),
                    overwrite=True,
                )

                form.instance.cloudinary_image_id = image_data['public_id']
                form.instance.cloudinary_image_url = image_data['url']
                form.instance.optimized_image_url = get_optimized_image_url(image_data['public_id'])
            except Exception as e:
                if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'message': f'Error Uploading Image: {str(e)}'
                    }, status=500)
                return self.handle_no_permission()
            return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'page_title': 'Update Project',
            'form_title': 'Update Project',
            'submit_text': 'Update Project'
        })
        return context

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return self.handle_no_authentication()
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'You are not authorized to update a project'
            }, status=403)
        raise PermissionDenied('You are not authorized to update a project')

    def handle_no_authentication(self):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'Please log in to continue',
                'redirect_url': f'{self.login_url}?{self.redirect_field_name}={self.request.path}'
            }, status=401)
        # Fix: Use redirect_to_login function correctly
        return redirect_to_login(
            self.request.get_full_path(),
            self.login_url,
            self.redirect_field_name
        )

 """


class UpdateProjectView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Projects
    form_class = ProjectsForm
    template_name = "app/projects/add_project.html"
    context_object_name = "view"
    success_url = reverse_lazy("app:projects")
    login_url = reverse_lazy("app:login")
    redirect_field_name = "next"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cloudinary_handler = CloudinaryImageHandler()
        self.uploaded_image_public_id = None

    def form_valid(self, form):
        # Preprocess form data
        form.instance.title = titlecase(form.instance.title)
        form.instance.description = form.instance.description.strip()

        # Check permissions first
        if not self.test_func():
            return self.handle_no_permission()

        try:
            # Start a database transaction to ensure atomic operations
            with transaction.atomic():
                # Upload image to Cloudinary if it exists
                image = form.files.get("image")
                if image:
                    # Generate a unique public ID for the image
                    public_id = uploader.get_public_id()

                    # Upload the image
                    image_data = self.cloudinary_handler.upload_image(
                        image,
                        folder=settings.PROJECTS_FOLDER,
                        public_id=public_id,
                        overwrite=True,
                    )

                    # Store the public ID in case we need to delete it
                    self.uploaded_image_public_id = image_data["public_id"]

                    # Set Cloudinary image details
                    form.instance.cloudinary_image_id = image_data["public_id"]
                    form.instance.cloudinary_image_url = image_data["url"]
                    form.instance.optimized_image_url = get_optimized_image_url(
                        image_data["public_id"]
                    )

                # Save the form
                response = super().form_valid(form)
                return response

        except Exception as e:
            # If an image was uploaded, delete it
            if self.uploaded_image_public_id:
                try:
                    self.cloudinary_handler.delete_image(self.uploaded_image_public_id)
                except Exception as cleanup_error:
                    # Log the cleanup error
                    print(f"Failed to delete Cloudinary image: {cleanup_error}")

            # Handle error response
            if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({"success": False, "errors": str(e)}, status=500)

            # For non-AJAX requests
            form.add_error(None, str(e))
            return self.form_invalid(form)

    def form_invalid(self, form):
        # For AJAX requests, return JSON error response
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({"success": False, "errors": form.errors}, status=400)

        # For non-AJAX requests, use default behavior
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "page_title": "Update Project",
                "form_title": "Update Project",
                "submit_text": "Update Project",
            }
        )
        return context

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return self.handle_no_authentication()

        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "You are not authorized to update a project",
                },
                status=403,
            )

        raise PermissionDenied("You are not authorized to update a project")

    def handle_no_authentication(self):
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "Please log in to continue",
                    "redirect_url": f"{self.login_url}?{self.redirect_field_name}={self.request.path}",
                },
                status=401,
            )

        return redirect_to_login(
            self.request.get_full_path(), self.login_url, self.redirect_field_name
        )


class DeleteProjectView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Projects
    template_name = "app/projects/deletion/confirm_delete.html"
    context_object_name = "view"
    success_url = reverse_lazy("app:projects")
    login_url = reverse_lazy("app:login")
    redirect_field_name = "next"

    def form_valid(self, form):
        if not self.test_func():
            return self.handle_no_permission()

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "page_title": "Delete Project",
                "form_title": "Delete Project",
                "submit_text": "Delete Project",
            }
        )
        return context

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return self.handle_no_authentication()
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "You are not authorized to delete a project",
                },
                status=403,
            )
        raise PermissionDenied("You are not authorized to delete a project")

    def handle_no_authentication(self):
        if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(
                {
                    "success": False,
                    "message": "Please log in to continue",
                    "redirect_url": f"{self.login_url}?{self.redirect_field_name}={self.request.path}",
                },
                status=401,
            )
        # Fix: Use redirect_to_login function correctly
        return redirect_to_login(
            self.request.get_full_path(), self.login_url, self.redirect_field_name
        )

    def delete(self, request, *args, **kwargs):
        project = self.get_object()

        if project.cloudinary_image_id:
            try:
                uploader.delete_image(project.cloudinary_image_id)
            except Exception as e:
                if self.request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return JsonResponse(
                        {
                            "success": False,
                            "message": f"Error Deleting Image: {str(e)}",
                        },
                        status=500,
                    )
                return self.handle_no_permission()
        return super().delete(request, *args, **kwargs)
