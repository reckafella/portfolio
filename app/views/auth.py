from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse
from ..helpers import is_ajax
from ..forms import LoginForm

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
                        return JsonResponse({'success': False, 'errors': error_message})
                    messages.error(request, error_message)
            else:
                error_message = 'Invalid email or password. Try again.'
                if is_ajax(request):
                    return JsonResponse({'success': False, 'errors': error_message})
                messages.error(request, error_message)
        else:
            if is_ajax(request):
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = LoginForm()
    
    context = {
        'form': form,
        'form_action_url': reverse('login'),
        'page_title': 'Login to Your Account',
        'form_title': 'Sign in',
        'submit_text': 'Login'
    }
    return render(request, 'auth/auth.html', context)


@login_required
def logout_view(request):
    """ View to handle user logout """
    logout(request)
    success_message = 'Successfully logged out. See you next time.'
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
        'reason': reason,
    })
