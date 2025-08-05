from django import forms
from django.contrib import admin
from django.conf import settings
from django.core.validators import (
    MaxLengthValidator,
    URLValidator,
    MinLengthValidator
)
from django.core.exceptions import ValidationError
# from django.forms import MultipleFileField

from app.models import Projects
from app.views.helpers.helpers import guess_file_type


class BaseProjectsForm(forms.ModelForm):
    """ Form to handle project info """
    title = forms.CharField(
        label="Project Title",
        required=True,
        min_length=5,
        max_length=200,
        validators=[MaxLengthValidator(200), MinLengthValidator(5)],
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "placeholder": "Enter the title of the project"
        }),
        help_text="Enter the title of the project",
    )
    description = forms.CharField(
        label="Project Description",
        required=True,
        min_length=25,
        max_length=1500,
        validators=[MaxLengthValidator(1500), MinLengthValidator(25)],
        widget=forms.Textarea(attrs={
            "class": "form-control",
            "rows": 5,
            "placeholder": "Enter a description for the project"
        }),
        help_text="Enter a description for the project",
    )
    project_type = forms.ChoiceField(
        label="Project Type",
        required=True,
        choices=Projects.PROJECT_TYPES,
        widget=forms.Select(attrs={
            "class": "form-control",
            "placeholder": "Select the project type"
        }),
        help_text="Select whether this is a personal or professional project",
    )
    category = forms.ChoiceField(
        label="Project Category",
        required=True,
        choices=settings.CATEGORY_CHOICES,
        widget=forms.Select(attrs={
            "class": "form-control",
            "placeholder": "Select the category of the project"
        }),
        help_text="Select the category of the project",
    )
    client = forms.CharField(
        label="Client Name",
        required=False,
        min_length=5,
        max_length=100,
        validators=[MaxLengthValidator(100), MinLengthValidator(5)],
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "placeholder": "Enter the client for the project"
        }),
        help_text="Enter the client for the project (default: Personal)",
    )
    project_url = forms.URLField(
        label="Project URL",
        required=True,
        max_length=250,
        validators=[URLValidator(message="Enter a valid URL",
                                 schemes=["http", "https"],),
                    MaxLengthValidator(250)],
        widget=forms.URLInput(attrs={
            "class": "form-control",
            "placeholder": "Enter the URL to the Project"
        }),
        help_text="URL to the Project",
    )
    images = forms.FileField(
        label="Upload Images",
        required=False,
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "multiple": True,
            "type": "file",
            "accept": ("image/jpeg,image/jpg,image/png,image/gif,"
                       "image/webp,image/bmp,image/svg+xml"),
            "data-max-files": "5",
            "data-max-size": "5242880",  # 5MB in bytes
            "data-max-total-size": "26214400"  # 25MB in bytes
        }),
        help_text=("Upload up to 5 images (max 5MB each, 25MB total). "
                   "Drag & drop supported. Supported formats: "
                   "JPG, PNG, GIF, WebP, BMP, SVG"),
    )

    youtube_urls = forms.CharField(
        label="YouTube URLs",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Type or Paste YouTube URLs (one per line)',
            'rows': 5
        }),
        required=False
    )
    live = forms.BooleanField(
        label="Publish Project",
        required=False,
        widget=forms.CheckboxInput(attrs={"class": "form-check-input"}),
    )

    class Meta:
        model = Projects
        fields = [
            "title",
            "description",
            "project_type",
            "category",
            "client",
            "project_url",
            "images",
            "youtube_urls",
            "live",
        ]

    def __init__(self, *args, **kwargs):
        # Store the request object for later use
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    def clean_youtube_urls(self):
        urls = self.cleaned_data.get('youtube_urls', '').strip().split('\n')
        cleaned_urls = []

        for url in urls:
            url = url.strip()
            if url:
                if not ('youtube.com' in url or 'youtu.be' in url):
                    raise ValidationError(f"Invalid YouTube URL: {url}")
                cleaned_urls.append(url)

        return cleaned_urls

    def clean_images(self):
        """Validate uploaded images with detailed error messages"""
        images = self.files.getlist('images')

        if not images:
            return images

        # Configuration
        max_size = 5 * 1024 * 1024  # 5MB per file
        max_files = 5
        max_total_size = 25 * 1024 * 1024  # 25MB total
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/webp', 'image/bmp', 'image/svg+xml'
        ]

        # Check file count
        if len(images) > max_files:
            raise ValidationError(
                f"Too many files uploaded. Maximum {max_files} images "
                f"allowed, but {len(images)} were provided."
            )

        valid_images = []
        total_size = 0
        errors = []

        for i, image in enumerate(images, 1):
            try:
                # Check file type
                file_type = guess_file_type(image)
                if not file_type.startswith('image/'):
                    errors.append(
                        f"File {i} ({image.name}): Not a valid image file "
                        f"(detected type: {file_type})"
                    )
                    continue

                # Check specific image format
                if file_type not in allowed_types:
                    errors.append(
                        f"File {i} ({image.name}): Unsupported image format "
                        f"({file_type}). Allowed formats: JPG, PNG, GIF, "
                        f"WebP, BMP, SVG"
                    )
                    continue

                # Check file size
                if image.size > max_size:
                    max_size_mb = max_size / (1024 * 1024)
                    file_size_mb = image.size / (1024 * 1024)
                    errors.append(
                        f"File {i} ({image.name}): Too large "
                        f"({file_size_mb:.1f}MB). Maximum {max_size_mb}MB "
                        f"per file allowed"
                    )
                    continue

                # Check if file is empty
                if image.size == 0:
                    errors.append(
                        f"File {i} ({image.name}): File is empty"
                    )
                    continue

                total_size += image.size
                valid_images.append(image)

            except Exception as e:
                errors.append(
                    f"File {i} ({image.name}): Error processing file - "
                    f"{str(e)}"
                )

        # Check total size
        if total_size > max_total_size:
            max_total_mb = max_total_size / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            errors.append(
                f"Total file size too large ({total_mb:.1f}MB). "
                f"Maximum {max_total_mb}MB total allowed"
            )

        # Raise validation errors if any
        if errors:
            raise ValidationError(errors)

        return valid_images

    def clean(self):
        """Cross-field validation"""
        cleaned_data = super().clean()
        images = self.files.getlist('images')
        youtube_urls = cleaned_data.get('youtube_urls', [])

        # Check if at least one media type is provided
        if not images and not youtube_urls:
            raise ValidationError("Provide at least one image or YouTube URL")

        return cleaned_data


class ProjectsForm(BaseProjectsForm):
    """Form to handle project info"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class ProjectsAdminForm(BaseProjectsForm):
    """form to handle project info in admin"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = Projects
        fields = "__all__"


class ProjectsAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at")
    search_fields = ("title", "description")
    list_filter = ("created_at",)
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
