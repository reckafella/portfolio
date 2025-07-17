from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import View
from django.views.generic.base import TemplateView

from authentication.forms.auth import LoginForm, SignupForm
from authentication.views.auth.base import BaseAuthentication
from app.views.helpers.helpers import is_ajax


class SignupView(BaseAuthentication):
    form_class = SignupForm

    def form_valid(self, form):
        username = form.cleaned_data.get("username")
        email = form.cleaned_data.get("email")

        # Check existing username/email
        if User.objects.filter(username=username).exists():
            error_message = "Username already exists. Try another."
            return self.handle_error(error_message)
        elif User.objects.filter(email=email).exists():
            error_message = "Email already exists. Try another."
            return self.handle_error(error_message)

        # Create and login user
        user = form.save(commit=False)
        user.email = email
        user.save()
        login(self.request, user)

        success_message = "Account created successfully. Welcome!"
        return self.handle_success(success_message)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        _next = self.request.GET.get("next") or "/"
        context.update({
            "page_title": "Create an Account",
            "form_title": "Create Account",
            "submit_text": "Create Account",
            "data_loading_text": "Creating Account",
            "next": self.get_success_url(),
            "extra_messages": [
                {
                    "text": "Already have an account?",
                    "link": f'{reverse("authentication:login")}?next={_next}',
                    "link_text": "Login",
                }
            ],
            "form_id": "signup-form",
        })
        return context


class LoginView(BaseAuthentication):
    form_class = LoginForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        _next = self.request.GET.get("next") or "/"
        context.update({
            "page_title": "Login to Your Account",
            "form_title": "Sign in",
            "submit_text": "Login",
            "data_loading_text": "Logging in",
            "next": self.get_success_url(),
            "extra_messages": [
                {
                    "text": "Don't have an account?",
                    "link": f'{reverse("authentication:signup")}?next={_next}',
                    "link_text": "Register",
                }
            ],
            "form_id": "login-form",
        })
        return context

    def form_valid(self, form):
        username = form.cleaned_data.get("username")
        password = form.cleaned_data.get("password")
        user = authenticate(self.request, username=username, password=password)

        if user is not None:
            if user.is_active:
                login(self.request, user)
                _user = username.capitalize()
                success_message = f"Login Successful. Welcome back, {_user}!"
                return self.handle_success(success_message)
            else:
                error_message = "Your account is disabled."
                return self.handle_error(error_message)
        else:
            error_message = "Invalid username or password."
            return self.handle_error(error_message)


class LogoutView(LoginRequiredMixin, View):

    def get(self, request):
        return self._handle_logout(request)

    def post(self, request):
        return self._handle_logout(request)

    def _handle_logout(self, request):
        _next = request.GET.get("next") or "/"
        redirect_url = f'{reverse("authentication:login")}?next={_next}'
        logout(request)
        success_message = "Successfully logged out. See you next time!"

        if is_ajax(request):
            return JsonResponse({
                "success": True,
                "messages": [success_message],
                "redirect_url": redirect_url,
            })

        messages.success(request, success_message)
        return redirect(redirect_url)


class CSRFFailureView(TemplateView):
    template_name = "errors/errors.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["errors"] = f"CSRF Failure: {self.kwargs.get('reason', '')}"
        return context
