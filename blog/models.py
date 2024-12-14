"""
this is the model for the blog post and it uses wagtail
"""

from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.models import Page
from wagtail.contrib.routable_page.models import RoutablePageMixin
from wagtail.fields import RichTextField
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.db import models


class BlogIndexPage(RoutablePageMixin, Page):
    subpage_types = ["blog.BlogPostPage"]
    max_count = 1

    content_panels = Page.content_panels + [
        FieldPanel("title"),
    ]

    def get_context(self, request):
        context = super().get_context(request)
        
        # Paginate blog posts
        posts = BlogPostPage.objects.live().order_by("-first_published_at")
        paginator = Paginator(posts, 9)  # 9 posts per page
        page_number = request.GET.get('page')
        
        try:
            page_obj = paginator.get_page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
        
        context['posts'] = page_obj
        context['is_paginated'] = page_obj.has_other_pages()
        
        return context


class BlogPostPage(Page):
    author = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, blank=True, related_name="blog_posts"
    )
    content = RichTextField()
    published = models.BooleanField(default=False)
    topics = models.CharField(
        max_length=200, default="all", help_text="Comma-separated list of topics"
    )
    cloudinary_image_id = models.CharField(max_length=200, blank=True, null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    content_panels = Page.content_panels + [
        FieldPanel("author"),
        FieldPanel("content"),
        FieldPanel("topics"),
        MultiFieldPanel(
            [
                FieldPanel("cloudinary_image_id", read_only=True),
                FieldPanel("cloudinary_image_url", read_only=True),
                FieldPanel("optimized_image_url", read_only=True),
            ],
            heading="Cloudinary Image Details",
        )
    ]

    class Meta:
        managed = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title + " by " + self.author.username

    def get_topics(self):
        return [topic.strip() for topic in self.topics.split(",")]
