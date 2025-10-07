import datetime
import os

from django.conf import settings
from django.http import (FileResponse, Http404, HttpResponseRedirect,
                         JsonResponse)
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import RedirectView, TemplateView, View
from rest_framework.views import APIView
from rest_framework.response import Response
from wagtail.models import Page
from django.utils.cache import get_cache_key, learn_cache_key

from app.utils.cache import cache_page_for_user, cache_page_with_prefix
from app.models import Projects
from blog.models import BlogPostPage as BlogPost


def get_view_cache_key(request, prefix, key_prefix=None):
    """Helper function to get a cache key for a view."""
    if not key_prefix:
        key_prefix = getattr(request, '_cache_prefix', '') or ''
    user_prefix = getattr(request, '_cache_user', '') or ''
    return f"{prefix}:{user_prefix}:{key_prefix}:{request.build_absolute_uri()}"


@method_decorator(cache_page_with_prefix('home', 300), name='dispatch')
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


@method_decorator(cache_page_with_prefix('about', 3600), name='dispatch')
class AboutView(TemplateView):
    """Class-based view to render the about page"""
    template_name = "app/about.html"
    status = 200


@method_decorator(cache_page_with_prefix('services', 3600), name='dispatch')
class ServicesView(TemplateView):
    """Class-based view to render the services page"""
    template_name = "app/services/services.html"
    status = 200

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Services"
        return context


@method_decorator(cache_page_with_prefix('resume', 3600), name='dispatch')
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
            as_attachment=True,
            headers={"Content-Disposition": 'inline; filename="resume.pdf"'},
        )


@method_decorator(cache_page_with_prefix('sitemap', 3600), name='dispatch')
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


@method_decorator(cache_page_with_prefix('sitemap-api', 3600), name='get')
class SitemapAPIView(APIView):
    """API view to provide sitemap data for React frontend"""

    def get(self, request):
        pages = Page.objects.live().specific().order_by('-first_published_at')
        projects = Projects.objects.filter(live=True).order_by('-created_at')
        blog_posts = BlogPost.objects.live().order_by('-first_published_at')

        # Serialize the data
        sitemap_data = {
            'pages': [
                {
                    'title': page.title,
                    'url': page.url,
                    'last_modified': page.last_published_at.isoformat() if page.last_published_at else None,
                }
                for page in pages
            ],
            'projects': [
                {
                    'title': project.title,
                    'slug': project.slug,
                    'url': f'/projects/{project.slug}',
                    'last_modified': project.updated_at.isoformat() if project.updated_at else None,
                }
                for project in projects
            ],
            'blog_posts': [
                {
                    'title': post.title,
                    'slug': post.slug,
                    'url': f'/blog/article/{post.slug}',
                    'last_modified': post.first_published_at.isoformat() if post.first_published_at else None,
                }
                for post in blog_posts
            ]
        }

        return Response(sitemap_data)


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


class AppHealthCheckView(View):
    """Class-based view to check the application health status"""

    def get(self, request, *args, **kwargs):
        """Handle GET requests to check if the app is running"""
        # You could add more health check metrics here
        time = datetime.datetime.now()
        request_ip = request.META.get('REMOTE_ADDR', 'unknown')
        return JsonResponse({
            "status": 200,
            "message": "App is running.",
            "version": getattr(settings, 'APP_VERSION', '1.0.0'),
            "environment": getattr(settings, 'ENVIRONMENT', 'production'),
            "request_ip": request_ip,
            "server_time": {
                'iso': time.isoformat(),
                'unix': int(time.timestamp()),
                'human_readable': time.strftime('%Y-%m-%d %H:%M:%S')
            }
        }, status=200)


def render_favicon(request):
    """View to render the favicon"""
    favicon_path = os.path.join(
        settings.BASE_DIR, "app", "static", "assets", "images",
        "icons", "favicon.icon"
    )

    if os.path.exists(favicon_path):
        return FileResponse(open(favicon_path, 'rb'),
                            content_type='image/x-icon')
    else:
        url = ('https://res.cloudinary.com/dg4sl9jhw/image/upload/'
               'portfolio-favicon_tdrrpe.ico')
        return HttpResponseRedirect(url)
