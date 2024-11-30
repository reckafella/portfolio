from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse

from app.forms import LoginForm, SignupForm
from app.views.helpers.helpers import is_ajax


def signup_view(request):
    if request.user.is_authenticated:
        return redirect("app:home")

    next_url = request.GET.get("next") or reverse("app:home")

    if request.method == "POST":
        form = SignupForm(request.POST, request.FILES)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            email = form.cleaned_data.get("email")
            # password = form.cleaned_data.get('password1')

            # Create user
            if User.objects.filter(username=username).exists():
                error_message = "Username already exists. Try another."
                if is_ajax(request):
                    return JsonResponse(
                        {"success": False, "errors": f"{error_message}"}
                    )
                messages.error(request, error_message)
            elif User.objects.filter(email=email).exists():
                error_message = "Email already exists. Try another."
                if is_ajax(request):
                    return JsonResponse(
                        {"success": False, "errors": f"{error_message}"}
                    )
                messages.error(request, error_message)
            else:
                user = form.save(commit=False)
                user.email = email
                user.save()
                login(request, user)
                success_message = (
                    "Account created successfully. Welcome to our platform!"
                )
                if is_ajax(request):
                    return JsonResponse(
                        {
                            "success": True,
                            "message": success_message,
                            "redirect_url": next_url,
                        }
                    )
                messages.success(request, success_message)
                return redirect(next_url)
        else:
            if is_ajax(request):
                return JsonResponse({"success": False, "errors": f"{form.errors}"})
    else:
        form = SignupForm()

    context = {
        "form": form,
        "page_title": "Create an Account",
        "form_title": "Create Account",
        "submit_text": "Create Account",
        "extra_messages": [
            {
                "text": "Already have an account?",
                "link": f"{reverse('app:login')}?next={next_url}",
                "link_text": "Login",
            }
        ],
        "next": next_url,
    }
    return render(request, "auth/auth.html", context)


def login_view(request):
    if request.user.is_authenticated:
        return redirect("app:home")

    next_url = request.GET.get("next") or reverse("app:home")

    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username: str = form.cleaned_data.get("username")
            password: str = form.cleaned_data.get("password")

            # Try to authenticate user
            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    user_name = username.capitalize()
                    success_message = (
                        f"Login Successful. Welcome Back {user_name}!"
                    )
                    if is_ajax(request):
                        return JsonResponse(
                            {
                                "success": True,
                                "message": success_message,
                                "redirect_url": next_url,
                            }
                        )
                    messages.success(request, success_message)
                    return redirect(next_url)
                else:
                    error_message = "Disabled account"
                    if is_ajax(request):
                        return JsonResponse(
                            {"success": False, "errors": f"{error_message}"}
                        )
                    messages.error(request, error_message)
            else:
                error_message = "Invalid email or password. Try again."
                if is_ajax(request):
                    return JsonResponse(
                        {"success": False, "errors": f"{error_message}"}
                    )
                messages.error(request, error_message)
        else:
            if is_ajax(request):
                return JsonResponse({"success": False, "errors": form.errors})
    else:
        form = LoginForm()

    context = {
        "form": form,
        "page_title": "Login to Your Account",
        "form_title": "Sign in",
        "submit_text": "Login",
        "extra_messages": [
            {
                "text": "Don't have an account?",
                "link": reverse("app:signup"),
                "link_text": "Register",
            }
        ],
        "next": next_url,  # Add this line
    }
    return render(request, "auth/auth.html", context)


@login_required
def logout_view(request):
    """View to handle user logout"""
    logout(request)
    success_message = "Successfully logged out. See you next time!"
    if is_ajax(request):
        return JsonResponse(
            {
                "success": True,
                "message": success_message,
                "redirect_url": reverse("app:home"),
            }
        )
    messages.success(request, success_message)
    return redirect("app:home")


def csrf_failure(request, reason=""):
    """View to handle CSRF failures"""
    return render(
        request,
        "errors/errors.html",
        {
            "errors": f"CSRF Failure: {reason}",
        },
    )
