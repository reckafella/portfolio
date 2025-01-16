from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import View
from django.views.generic.base import TemplateView

from app.forms.auth import LoginForm, SignupForm
from app.views.helpers.base_auth_class import BaseAuthentication
from app.views.helpers.helpers import is_ajax



class SignupView(BaseAuthentication):
    form_class = SignupForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Create an Account",
            "form_title": "Create Account",
            "submit_text": "Create Account",
            "next": self.get_success_url(),
            "extra_messages": [
                {
                    "text": "Already have an account?",
                    "link": reverse("app:login"),
                    "link_text": "Login",
                }
            ],
        })
        return context

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
        
        success_message = "Account created successfully. Welcome to our platform!"
        return self.handle_success(success_message)


class LoginView(BaseAuthentication):
    form_class = LoginForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Login to Your Account",
            "form_title": "Sign in",
            "submit_text": "Login",
            "next": self.get_success_url(),
            "extra_messages": [
                {
                    "text": "Don't have an account?",
                    "link": reverse("app:signup"),
                    "link_text": "Register",
                }
            ],
        })
        return context

    def form_valid(self, form):
        username = form.cleaned_data.get("username")
        password = form.cleaned_data.get("password")
        user = authenticate(self.request, username=username, password=password)

        if user is not None:
            if user.is_active:
                login(self.request, user)
                success_message = f"Login Successful. Welcome back, {username.capitalize()}!"
                return self.handle_success(success_message)
            else:
                error_message = "Your account is disabled."
                return self.handle_error(error_message)
        else:
            error_message = "Invalid username or password."
            return self.handle_error(error_message)

class LogoutView(LoginRequiredMixin, View):
    def get(self, request):
        is_staff_user = request.user.is_staff and hasattr(request.user, 'is_staff')
        logout(request)
        success_message = "Successfully logged out. See you next time!"
        
        redirect_url = reverse("app:login") if is_staff_user else reverse("app:home")
        
        if is_ajax(self.request):
            return JsonResponse({
                "success": True,
                "message": success_message,
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
