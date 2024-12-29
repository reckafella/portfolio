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

            # Check if the username or email already exists
            if User.objects.filter(username=username).exists():
                error_message = "Username already exists. Try another."
                if is_ajax(request):
                    return JsonResponse({"success": False, "errors": error_message})
                messages.error(request, error_message)
            elif User.objects.filter(email=email).exists():
                error_message = "Email already exists. Try another."
                if is_ajax(request):
                    return JsonResponse({"success": False, "errors": error_message})
                messages.error(request, error_message)
            else:
                user = form.save(commit=False)
                user.email = email
                user.save()
                login(request, user)
                success_message = "Account created successfully. Welcome to our platform!"
                if is_ajax(request):
                    return JsonResponse({"success": True, "message": success_message, "redirect_url": next_url})
                messages.success(request, success_message)
                return redirect(next_url)
        else:
            if is_ajax(request):
                return JsonResponse({"success": False, "errors": form.errors})
    else:
        form = SignupForm()

    # Return form only for AJAX requests
    if is_ajax(request):
        return render(request, "auth/auth.html", {"form": form})

    context = {
        "form": form,
        "page_title": "Create an Account",
        "form_title": "Create Account",
        "submit_text": "Create Account",
        "next": next_url,
        "extra_messages": [
            {
                "text": "Already have an account?",
                "link": reverse("app:login"),
                "link_text": "Login",
            }
        ],
    }
    return render(request, "auth/auth.html", context)


def login_view(request):
    if request.user.is_authenticated:
        return redirect("app:home")

    next_url = request.GET.get("next") or reverse("app:home")

    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    success_message = f"Login Successful. Welcome back, {username.capitalize()}!"
                    if is_ajax(request):
                        return JsonResponse({"success": True, "message": success_message, "redirect_url": next_url})
                    messages.success(request, success_message)
                    return redirect(next_url)
                else:
                    error_message = "Your account is disabled."
                    if is_ajax(request):
                        return JsonResponse({"success": False, "errors": error_message})
                    messages.error(request, error_message)
            else:
                error_message = "Invalid username or password."
                if is_ajax(request):
                    return JsonResponse({"success": False, "errors": error_message})
                messages.error(request, error_message)
        else:
            if is_ajax(request):
                return JsonResponse({"success": False, "errors": form.errors})
    else:
        form = LoginForm()

    # Return form only for AJAX requests
    if is_ajax(request):
        return render(request, "auth/auth.html", {"form": form})

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
    # Store user type before logout since request.user will be Anonymous after logout
    is_staff_user = request.user.is_staff and hasattr(request.user, 'is_staff')
    
    # Perform logout
    logout(request)
    
    success_message = "Successfully logged out. See you next time!"
    
    # Determine redirect URL
    if is_staff_user:
        redirect_url = reverse("app:login")
    else:
        redirect_url = reverse("app:home")

    if is_ajax(request):
        return JsonResponse({
            "success": True,
            "message": success_message,
            "redirect_url": redirect_url,
        })
    
    messages.success(request, success_message)
    return redirect(redirect_url) 

def csrf_failure(request, reason=""):
    """View to handle CSRF failures"""
    return render(
        request,
        "errors/errors.html",
        {
            "errors": f"CSRF Failure: {reason}",
        },
    )
