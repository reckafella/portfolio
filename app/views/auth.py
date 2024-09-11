from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse
from django.contrib.auth.models import User

from ..helpers import is_ajax
from ..forms import LoginForm, SignupForm


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = SignupForm(request.POST, request.FILES)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password1')

            # Create user
            if User.objects.filter(username=username).exists():
                error_message = 'Username already exists. Try another.'
                if is_ajax(request):
                    return JsonResponse({'success': False, 'errors': error_message})
                messages.error(request, error_message)
            elif User.objects.filter(email=email).exists():
                error_message = 'Email already exists. Try another.'
                if is_ajax(request):
                    return JsonResponse({'success': False, 'errors': error_message})
                messages.error(request, error_message)
            else:
                user = form.save(commit=False)
                user.email = email
                user.save()
                login(request, user)
                success_message = 'Account created successfully. Welcome to our platform!'
                if is_ajax(request):
                    return JsonResponse({
                        'success': True,
                        'message': success_message,
                        'redirect_url': reverse('home')
                    })
                messages.success(request, success_message)
                return redirect('home')
        else:
            if is_ajax(request):
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = SignupForm()
    
    context = {
        'form': form,
        'page_title': 'Create an Account',
        'form_title': 'Create Account',
        'submit_text': 'Create Account',
        'extra_messages': [{
            'text': 'Already have an account?',
            'link': reverse('login'),
            'link_text': 'Login'
            }]
    }
    return render(request, 'auth/auth.html', context)

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            
            # Try to authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    login(request, user)
                    success_message = 'Login Successful. Welcome back!'
                    if is_ajax(request):
                        return JsonResponse({
                            'success': True,
                            'message': success_message,
                            'redirect_url': reverse('home')
                        })
                    messages.success(request, success_message)
                    return redirect('home')
                else:
                    error_message = 'Disabled account'
                    if is_ajax(request):
                        return JsonResponse({
                            'success': False,
                            'errors': error_message
                            })
                    messages.error(request, error_message)
            else:
                error_message = 'Invalid email or password. Try again.'
                if is_ajax(request):
                    return JsonResponse({
                        'success': False,
                        'errors': error_message
                        })

                messages.error(request, error_message)
        else:
            if is_ajax(request):
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                    })
    else:
        form = LoginForm()
    
    context = {
        'form': form,
        'page_title': 'Login to Your Account',
        'form_title': 'Sign in',
        'submit_text': 'Login',
        'extra_messages': [{
            'text': 'Don\'t have an account?',
            'link': reverse('signup'),
            'link_text': 'Register'}]
    }
    return render(request, 'auth/auth.html', context)


@login_required
def logout_view(request):
    """ View to handle user logout """
    logout(request)
    success_message = 'Successfully logged out. See you next time!'
    if is_ajax(request):
        return JsonResponse({
            'success': True,
            'message': success_message,
            'redirect_url': reverse('home')
        })
    messages.success(request, success_message)
    return redirect('home')

def csrf_failure(request, reason=""):
    """View to handle CSRF failures"""
    return render(request, 'errors/errors.html', {
        'errors': f'CSRF Failure: {reason}',
    })


def page_not_found(request, exception):
    """View to handle 404 errors"""
    return render(request, 'errors/errors.html', {
        'errors': f'Page not found + ${exception}',
    })


def server_error(request):
    """View to handle 500 errors"""
    return render(request, 'errors/errors.html', {
        'errors': 'Server Error',
    })
