from django import forms
from django.contrib import admin
from django.core.validators import (
    EmailValidator,
    MaxLengthValidator
)
from captcha.fields import CaptchaField, CaptchaTextInput

from app.models import Message


class ContactForm(forms.Form):
    name = forms.CharField(
        label="Name",
        required=True,
        max_length=100,
        widget=forms.TextInput(attrs={"class": "form-control focus-ring"}),
    )
    email = forms.EmailField(
        label="Email",
        required=True,
        validators=[EmailValidator()],
        widget=forms.EmailInput(attrs={"class": "form-control focus-ring"}),
    )
    subject = forms.CharField(
        label="Subject",
        required=True,
        max_length=200,
        validators=[MaxLengthValidator(200)],
        widget=forms.TextInput(attrs={"class": "form-control focus-ring"}),
    )
    message = forms.CharField(
        label="Message",
        widget=forms.Textarea(attrs={"class": "form-control focus-ring"}),
        help_text="Enter your message here",
    )

    captcha = CaptchaField(
        label="Captcha",
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control focus-ring"}),
    )

    def clean(self):
        cleaned_data = super().clean()
        fields = ["name", "email", "subject", "message"]
        if not all(cleaned_data.get(field) for field in fields):
            raise forms.ValidationError("All fields are required!")
        return cleaned_data

    def save(self):
        name = self.cleaned_data.get("name")
        email = self.cleaned_data.get("email")
        subject = self.cleaned_data.get("subject")
        message = self.cleaned_data.get("message")
        if name and subject and email and message:
            Message.objects.create(name=name, email=email,
                                   subject=subject, message=message)
        else:
            raise forms.ValidationError("All fields are required!")


class ContactFormAdminForm(admin.ModelAdmin):
    """form to handle contact info in admin"""

    class Meta:
        model = Message
        fields = "__all__"
