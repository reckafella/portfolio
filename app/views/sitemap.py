from django.contrib.sitemaps import Sitemap
from wagtail.models import Page
from blog.models import BlogPostPage
from app.models import Projects

class BlogPostSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8

    def items(self):
        return BlogPostPage.objects.live()

    def lastmod(self, obj):
        return obj.last_published_at

class WagtailSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.6

    def items(self):
        return Page.objects.live().specific()

    def lastmod(self, obj):
        return obj.last_published_at


class ProjectsSitemap(Sitemap):
    changefreq = 'daily'
    priority = 0.7

    def items(self):
        return Projects.objects.all()

    def lastmod(self, obj):
        return obj.updated_at or obj.created_at
