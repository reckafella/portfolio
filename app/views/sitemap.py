from django.contrib.sitemaps import Sitemap
from wagtail.models import Page
from blog.models import BlogPostPage

class BlogPostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return BlogPostPage.objects.live()

    def lastmod(self, obj):
        return obj.last_published_at

class WagtailSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.5

    def items(self):
        return Page.objects.live().specific()

    def lastmod(self, obj):
        return obj.last_published_at
