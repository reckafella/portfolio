"""
this is the model for the blog post using wagtail cms
"""

from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.models import Page
from wagtail.contrib.routable_page.models import RoutablePageMixin
from wagtail.fields import RichTextField
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.db import models
from taggit.managers import TaggableManager


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
        paginator = Paginator(posts, 6)  # 6 posts per page
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
        User,
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name="blog_posts"
    )
    content = RichTextField()
    published = models.BooleanField(default=False)
    post_created_at = models.DateTimeField(auto_now_add=True, null=True)
    post_updated_at = models.DateTimeField(auto_now=True, null=True)
    tags = TaggableManager(blank=True, help_text="Add comma-separated tags")
    cloudinary_image_id = models.CharField(max_length=200, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    view_count = models.PositiveIntegerField(default=0,
                                             help_text="Number of page views")

    content_panels = Page.content_panels + [
        FieldPanel("author"),
        FieldPanel("content"),
        FieldPanel("tags"),
        MultiFieldPanel(
            [
                FieldPanel("cloudinary_image_id", read_only=True),
                FieldPanel("cloudinary_image_url", read_only=True),
                FieldPanel("optimized_image_url", read_only=True),
                FieldPanel("post_created_at", read_only=True),
                FieldPanel("post_updated_at", read_only=True),
                FieldPanel("view_count", read_only=True),
            ],
            heading="Cloudinary Image Details - Readonly",
        ),
        FieldPanel("published"),
    ]

    class Meta:
        managed = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def first_image(self):
        return self.images.first() if self.images.first() else None

    def __str__(self):
        return self.title + " by " + self.author.username

    def increment_view_count(self):
        """Increment the view count for this post"""
        self.view_count = models.F('view_count') + 1
        self.save(update_fields=['view_count'])
        self.refresh_from_db(fields=['view_count'])

    def get_tags(self):
        """Return list of tag names"""
        return [tag.name for tag in self.tags.all()]

    def get_context(self, request):
        context = super().get_context(request)
        context["author"] = self.author
        context["post"] = self
        context["tags"] = self.get_tags()
        context["date_published"] = self.first_published_at or\
            self.post_created_at
        context["view_count"] = self.view_count

        return context


class ViewCountAttempt(models.Model):
    """Track view count attempts for abuse detection"""
    article = models.ForeignKey(BlogPostPage, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'view_count_attempts'
        indexes = [
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['article', 'timestamp']),
        ]


class BlogPostImage(models.Model):
    post = models.ForeignKey(
        BlogPostPage,
        on_delete=models.PROTECT,
        related_name="images"
    )
    cloudinary_image_id = models.CharField(max_length=255, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.post.title} - Image"


class BlogPostComment(models.Model):
    post = models.ForeignKey(
        BlogPostPage,
        on_delete=models.PROTECT,
        related_name="comments"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author.username} on {self.post.title}"


class BlogPostCommentReply(models.Model):
    comment = models.ForeignKey(
        BlogPostComment,
        on_delete=models.PROTECT,
        related_name="replies"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="replies_to_comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author.username} on {self.comment.post.title}"
