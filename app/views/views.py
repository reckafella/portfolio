import os
from wagtail.models import Page
from django.conf import settings
from django.http import FileResponse, Http404
from django.views.generic.base import RedirectView
from django.shortcuts import render

from app.models import Projects
from blog.models import BlogPostPage as BlogPost

from blog.models import BlogPostPage


def home_view(request):
    """View to render the home page"""
    n = 4
    featured_projects = Projects.objects.all()[:n]
    recent_posts = BlogPost.objects.live().order_by("-first_published_at")[:n]

    context = {
        "featured_projects": featured_projects,
        "latest_posts": recent_posts,
    }
    return render(
        request=request, template_name="app/home.html", context=context, status=200
    )


def about_view(request):
    """View to render the about page"""
    return render(request=request, template_name="app/about.html", status=200)


def resume_view(request):
    """View to render the resume page"""
    context = {"page_title": "Resume"}
    return render(
        request=request, template_name="app/resume.html", context=context, status=200
    )


def resume_pdf_view(request):
    """View to render the resume page"""
    resume_path = os.path.join(
        settings.BASE_DIR, "app", "static", "assets", "data", "resume.pdf"
    )

    if not os.path.exists(resume_path):
        raise Http404("Resume not found")

    return FileResponse(
        open(resume_path, "rb"),
        content_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="resume.pdf"'},
    )


def sitemap_view(request):
    pages = Page.objects.live().specific()
    blog_posts = BlogPostPage.objects.live().order_by('-first_published_at')
    
    context = {
        'pages': pages,
        'blog_posts': blog_posts,
    }
    return render(request, 'app/sitemaps/sitemap.html', context)


class CustomRedirectView(RedirectView):
    """Custom RedirectView to handle redirections"""
    permanent = False
    query_string = True
    redirect_to = "/"

    def get_redirect_url(self, *args, **kwargs):
        """Method to get the redirect URL"""
        redirect_to = self.redirect_to

        query_params = self.request.GET.urlencode()
        if query_params:
            return f'{redirect_to}?{query_params}'
        return redirect_to
