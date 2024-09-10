from django.http import JsonResponse
from django.shortcuts import render

from ..helpers import is_ajax


def home_view(request):
    """ View to render the home page """
    return render(request=request, template_name='app/home.html', status=200)


def about_view(request):
    """ View to render the about page """
    return render(request=request, template_name='app/about.html', status=200)


def contact_view(request):
    """ View to render the contact page """
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')

        # send email
        # send_email(name, email, message)
        if is_ajax(request):
            if name and email and message:
                return JsonResponse({'success': True, 'message': 'Message sent successfully'})
            else:
                return JsonResponse({'success': False, 'message': 'All fields are required'})

    return render(request=request, template_name='app/contact.html', status=200)
