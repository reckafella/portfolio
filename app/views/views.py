import os
from wagtail.models import Page
from django.conf import settings
from django.http import FileResponse, Http404
from django.views.generic.base import RedirectView, TemplateView, View

from app.models import Projects
from blog.models import BlogPostPage as BlogPost


class HomeView(TemplateView):
    """Class-based view to render the home page"""
    template_name = "app/home.html"
    status = 200

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        n = 4
        # featured projects
        context["projects"] = Projects.objects.filter(live=True)[:n]
        # latest blog posts

        posts = BlogPost.objects.live()\
            .order_by("-first_published_at")[:n]
        context["posts"] = posts
        return context


class AboutView(TemplateView):
    """Class-based view to render the about page"""
    template_name = "app/about.html"
    status = 200


class ServicesView(TemplateView):
    """Class-based view to render the services page"""
    template_name = "app/services/services.html"
    status = 200


class ResumeView(TemplateView):
    """Class-based view to render the resume page"""
    template_name = "app/resume.html"
    status = 200

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Resume"
        return context


class ResumePDFView(View):
    """Class-based view to render the resume PDF"""
    status = 200

    def dispatch(self, request, *args, **kwargs):
        # Set the content type to application/pdf
        self.content_type = "application/pdf"
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
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


class SitemapView(TemplateView):
    """Class-based view to render the sitemap"""
    template_name = "app/sitemaps/sitemap.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        pages = Page.objects.live().specific().order_by('-first_published_at')
        projects = Projects.objects.filter(live=True).order_by('-created_at')
        blog_posts = BlogPost.objects.live().order_by('-first_published_at')
        context['pages'] = pages
        context['projects'] = projects
        context['blog_posts'] = blog_posts
        context['page_title'] = "Sitemap"
        return context


class CustomRedirectView(RedirectView):
    """Custom RedirectView to handle redirections"""
    permanent = True
    query_string = True
    redirect_to = "/"

    def get_redirect_url(self, *args, **kwargs):
        """Method to get the redirect URL"""
        redirect_to = self.redirect_to

        query_params = self.request.GET.urlencode()
        if query_params:
            return f'{redirect_to}?{query_params}'
        return redirect_to
