from django import forms
from django.contrib import admin
from django.core.validators import (
    MaxLengthValidator,
    URLValidator,
)
from captcha.fields import CaptchaField, CaptchaTextInput

from app.models import Projects


class ProjectsForm(forms.ModelForm):
    title = forms.CharField(
        label="Project Title",
        required=True,
        max_length=200,
        validators=[MaxLengthValidator(200)],
        widget=forms.TextInput(attrs={"class": "form-control focus-ring"}),
        help_text="Enter the title of the project",
    )
    description = forms.CharField(
        label="Project Description",
        required=True,
        widget=forms.Textarea(attrs={"class": "form-control focus-ring"}),
        help_text="Enter a description for the project",
    )
    project_url = forms.URLField(
        label="Project URL",
        required=True,
        validators=[URLValidator()],
        widget=forms.URLInput(attrs={"class": "form-control"}),
        help_text="URL to the Project",
    )
    image = forms.ImageField(
        label="Upload Image",
        required=False,
        widget=forms.FileInput(attrs={"class": "form-control"}),
        help_text="Upload an image for your project (jpg, jpeg, png, gif, webp)",
    )

    captcha = CaptchaField(
        label="Captcha",
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control focus-ring"}),
    )

    class Meta:
        model = Projects
        fields = ["title", "description", "project_url", "image", "captcha"]


class ProjectsAdminForm(forms.ModelForm):
    """form to handle project info in admin"""

    description = forms.CharField(
        label="Project Description",
        required=True,
        widget=forms.Textarea(attrs={"class": "form-control"}),
        help_text="Enter a description for the project",
    )

    project_url = forms.URLField(
        label="Project URL",
        required=True,
        validators=[URLValidator()],
        widget=forms.URLInput(attrs={"class": "form-control"}),
        help_text="URL to the Project",
    )

    image = forms.ImageField(
        label="Upload Image",
        required=False,
        widget=forms.FileInput(attrs={"class": "form-control"}),
        help_text="Upload an image for your project (jpg, jpeg, png, gif, webp)",
    )

    captcha = CaptchaField(
        label="Captcha",
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control focus-ring"}),
    )
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
