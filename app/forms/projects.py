from django import forms
from django.contrib import admin
from django.conf import settings
from django.core.validators import (
    MaxLengthValidator,
    URLValidator,
)
from django.core.exceptions import ValidationError

from app.models import Projects
from app.views.helpers.helpers import guess_file_type


class BaseProjectsForm(forms.ModelForm):
    """ Form to handle project info """
    title = forms.CharField(
        label="Project Title",
        required=True,
        max_length=200,
        validators=[MaxLengthValidator(200)],
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "placeholder": "Enter the title of the project"
        }),
        help_text="Enter the title of the project",
    )
    description = forms.CharField(
        label="Project Description",
        required=True,
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
        max_length=200,
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "placeholder": "Enter the client for the project"
        }),
        help_text="Enter the client for the project (default: Personal)",
    )
    project_url = forms.URLField(
        label="Project URL",
        required=True,
        validators=[URLValidator()],
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
            "type": "File",
            "multiple": True
        }),
        help_text="Upload image(s) (jpg, jpeg, png, gif, webp)",
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

    def clean(self):
        cleaned_data = super().clean()
        images = self.files.getlist('images')
        youtube_urls = cleaned_data.get('youtube_urls', [])

        if not images and not youtube_urls:
            raise ValidationError("Please provide at least one image or YouTube URL")

        if images:
            for image in images:
                if not guess_file_type(image).startswith('image/'):
                    raise ValidationError(f"File {image.name} is not an image")

        return cleaned_data


class ProjectsForm(BaseProjectsForm):
    """form to handle project info"""
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
