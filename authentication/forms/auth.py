from captcha.fields import CaptchaField, CaptchaTextInput
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.validators import (EmailValidator, MaxLengthValidator,
                                    MinLengthValidator)


class LoginForm(forms.Form):
    """form to handle login info"""

    username = forms.CharField(
        label="Username",
        required=True,
        min_length=3,
        max_length=30,
        validators=[MinLengthValidator(3), MaxLengthValidator(30)],
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    password = forms.CharField(
        label="Password",
        required=True,
        min_length=8,
        max_length=64,
        validators=[MinLengthValidator(8), MaxLengthValidator(64)],
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "id": "password1"},
            render_value=True
        ),
        help_text="Password must be at least 8 characters long",
    )

    captcha = CaptchaField(
        label="Captcha",
        required=True,
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control"}),
    )


class SignupForm(UserCreationForm):
    """form to handle register info"""

    username = forms.CharField(
        label="Username",
        required=True,
        min_length=3,
        max_length=30,
        validators=[MaxLengthValidator(30), MinLengthValidator(3)],
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    first_name = forms.CharField(
        label="First Name",
        required=True,
        max_length=30,
        validators=[MaxLengthValidator(30)],
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    last_name = forms.CharField(
        label="Last Name",
        required=True,
        max_length=30,
        validators=[MaxLengthValidator(30)],
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    email = forms.EmailField(
        label="Email",
        required=True,
        validators=[EmailValidator()],
        widget=forms.EmailInput(attrs={"class": "form-control"}),
    )

    password1 = forms.CharField(
        label="Password",
        required=True,
        min_length=8,
        max_length=64,
        validators=[MaxLengthValidator(64), MinLengthValidator(8)],
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "id": "password1"},
            render_value=True
        ),
        help_text="Password must be at least 8 characters long",
    )

    password2 = forms.CharField(
        label="Confirm Password",
        required=True,
        min_length=8,
        max_length=64,
        validators=[MaxLengthValidator(64)],
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "id": "password2"},
            render_value=True
        ),
        help_text="Password must be at least 8 characters long",
    )

    captcha = CaptchaField(
        label="Captcha",
        required=True,
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control"}),
    )

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
            "captcha",
        ]

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 != password2:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data

    def save(self, commit=True):
        user = super(SignupForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.username = self.cleaned_data["username"]

        if commit:
            user.save()
        return user


class AdminLoginForm(forms.Form):
    """form to handle admin login info"""

    username = forms.CharField(
        label="Username",
        required=True,
        min_length=3,
        max_length=30,
        validators=[MaxLengthValidator(30), MinLengthValidator(3)],
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    password = forms.CharField(
        label="Password",
        required=True,
        min_length=8,
        max_length=64,
        validators=[MaxLengthValidator(64), MinLengthValidator(8)],
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "id": "password1"},
            render_value=True
        ),
        help_text="Password must be at least 8 characters long",
    )

    captcha = CaptchaField(
        label="Captcha",
        required=True,
        help_text="Enter the characters shown in the image",
        widget=CaptchaTextInput(attrs={"class": "form-control"}),
    )
