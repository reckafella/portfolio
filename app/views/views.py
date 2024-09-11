import os
from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404
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


def resume_view(request):
    """ View to render the resume page """
    context = {
        'page_title': 'Resume'
    }
    return render(request=request, template_name='app/resume.html', context=context, status=200)


def resume_pdf_view(request):
    """ View to render the resume page """
    resume_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'resume.pdf')
    
    if not os.path.exists(resume_path):
        raise Http404('Resume not found')
    
    return FileResponse(open(resume_path, 'rb'),
                        content_type='application/pdf',
                        headers={ 'Content-Disposition': 'inline; filename="resume.pdf"' })