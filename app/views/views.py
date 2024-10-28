import os
from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404
from django.shortcuts import render

from ..forms import ContactForm
from ..helpers import is_ajax
from app.models import Projects
from blog.models import BlogPost


def home_view(request):
    """ View to render the home page """
    featured_projects = Projects.objects.all()[:3]
    recent_posts = BlogPost.objects.all().order_by('-created_at')[:3]

    context = {
        'featured_projects': featured_projects,
        'latest_posts': recent_posts,
    }
    return render(request=request, template_name='app/home.html', context=context, status=200)


def about_view(request):
    """ View to render the about page """
    return render(request=request, template_name='app/about.html', status=200)


def contact_view(request):
    """ View to render the contact page """
    form = ContactForm()
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data.get('name')
            email = form.cleaned_data.get('email')
            subject = form.cleaned_data.get('subject')
            message = form.cleaned_data.get('message')
    
            if name and subject and email and message:
                form.save()
                response = {'success': True, 'message': 'Message sent successfully'}

            else:
                response = {'success': False, 'message': 'All fields are required'}
            
            if is_ajax(request):
                    return JsonResponse(response)
    else:
        form = ContactForm()

    context = {
        'form': form,
        'page_title': 'Contact',
        'submit_text': 'Send Message'
    }
    return render(request=request, template_name='app/contact.html', context=context, status=200)


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
