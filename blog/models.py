"""
this is the model for the blog post using wagtail cms
"""
import hashlib
import logging
from django.contrib.auth.models import User
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db import models
from django.db.models import Count
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils import timezone
from django.utils.text import slugify
from modelcluster.fields import ParentalKey
from taggit.managers import TaggableManager
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.routable_page.models import RoutablePageMixin
from wagtail.fields import RichTextField
from wagtail.models import Orderable, Page

from blog.wagtail_models import CloudinaryWagtailImage

logger = logging.getLogger(__name__)


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
    # Current RichTextField (to be converted to StreamField)
    content = RichTextField(blank=True, null=True)

    published = models.BooleanField(default=False)
    post_created_at = models.DateTimeField(auto_now_add=True, null=True)
    post_updated_at = models.DateTimeField(auto_now=True, null=True)
    tags = TaggableManager(blank=True, help_text="Add comma-separated tags")

    # Legacy Cloudinary fields (to be deprecated after migration)
    cloudinary_image_id = models.CharField(max_length=200, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    view_count = models.PositiveIntegerField(default=0,
                                             help_text="Number of page views")
    last_view_increment = models.DateTimeField(
        auto_now=True, null=True, blank=True,
        help_text="Timestamp of the last view count increment"
    )

    content_panels = Page.content_panels + [
        FieldPanel("author"),
        FieldPanel("content", heading="Current Content (RichText)"),
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
            heading="Legacy Image Details (Readonly)",
        ),
        FieldPanel("published"),
    ]

    class Meta(Page.Meta):
        managed = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def first_image(self):
        """Get the first image from the gallery or legacy image"""
        gallery_image = self.gallery_images.first()
        if gallery_image:
            return gallery_image.image
        # Fallback to legacy image system
        return self.images.first() if hasattr(self, 'images') else None

    @property
    def cover_image_url(self):
        """
        Get the cover image URL (first image or legacy optimized_image_url)
        """
        first_img = self.first_image
        if first_img and hasattr(first_img, 'optimized_image_url'):
            return first_img.optimized_image_url
        elif first_img and hasattr(first_img, 'file'):
            return first_img.file.url
        # Fallback to legacy system
        return self.optimized_image_url or None

    def __str__(self):
        return (
            f"{self.title} by {self.author.username}"
            if self.author and self.author.username
            else "Anonymous"
        )

    def increment_view_count(self, request):
        """Increment the view count for this post"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        visitor_hash = hashlib.sha256(
            f"{ip}_{user_agent}".encode()).hexdigest()

        _, created = ViewCountAttempt.objects.get_or_create(
            article=self,
            visitor_hash=visitor_hash,
            defaults={
                'ip_address': ip,
                'user_agent': user_agent,
                'user': request.user if request.user.is_authenticated else None
            }
        )
        if created:
            BlogPostPage.objects.filter(pk=self.pk).update(
                view_count=models.F('view_count') + 1,
                last_view_increment=timezone.now()
            )
            self.refresh_from_db(fields=['view_count', 'last_view_increment'])
            return True
        return False

    def get_tag_counts(self):
        articles = BlogPostPage.objects.all()
        if not articles.exists():
            return []

        # Get all tags used by the articles in the queryset
        # Use distinct to avoid duplicates and annotate with count
        from taggit.models import Tag

        # Get tag IDs that are used by our filtered articles
        article_ids = list(articles.values_list('id', flat=True))

        # Query tags that are associated with these articles
        tags_with_counts = (
            Tag.objects
            .filter(
                taggit_taggeditem_items__object_id__in=article_ids,
                taggit_taggeditem_items__content_type__model='blogpostpage'
            ).annotate(article_count=Count('taggit_taggeditem_items',
                                           distinct=True)).order_by('name'))

        tag_count = [(tag.name, tag.article_count) for tag in tags_with_counts]

        all_count = articles.count()
        return [("all", all_count)] + tag_count

    def get_view_count_display(self):
        """Return view count as a formatted string"""
        if self.view_count == 1:
            return "1 view"
        else:
            return f"{self.view_count} views"

    def get_tags(self):
        """Return list of tag names"""
        return [tag.name for tag in self.tags.all()]

    def get_context(self, request):
        context = super().get_context(request)
        context["author"] = self.author
        context["post"] = self
        context["tags"] = self.get_tags()
        context["all_tags"] = self.get_tag_counts()
        context["date_published"] = self.first_published_at or\
            self.post_created_at
        context["view_count"] = self.view_count

        return context


class BlogPostPageGalleryImage(Orderable):
    """
    Through model for attaching Cloudinary-backed images to blog posts
    """
    page = ParentalKey(
        BlogPostPage,
        on_delete=models.CASCADE,
        related_name='gallery_images'
    )
    image = models.ForeignKey(
        CloudinaryWagtailImage,
        on_delete=models.CASCADE,
        related_name='+'
    )
    caption = models.CharField(max_length=250, blank=True)

    panels = [
        FieldPanel('image'),
        FieldPanel('caption'),
    ]

    def __str__(self):
        return f"Image for {self.page.title}"


class ViewCountAttempt(models.Model):
    """Track view count attempts for abuse detection"""
    article = models.ForeignKey(BlogPostPage, on_delete=models.CASCADE)
    visitor_hash = models.CharField(max_length=64, blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    reason = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True,
                             null=True, related_name="view_count_attempts")

    class Meta:
        db_table = 'view_count_attempts'
        unique_together = ['article', 'visitor_hash']
        indexes = [
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['article', 'visitor_hash']),
        ]


class BlogPostImage(models.Model):
    post = models.ForeignKey(
        BlogPostPage,
        on_delete=models.CASCADE,  # Changed from PROTECT to allow deletion
        related_name="images"
    )
    cloudinary_image_id = models.CharField(max_length=255, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.post.title} - Image"

    def delete(self, *args, **kwargs):
        """
        Override delete to remove image from Cloudinary before database deletion
        """
        # Delete from Cloudinary first if image ID exists
        if self.cloudinary_image_id:
            try:
                from app.views.helpers.cloudinary import CloudinaryImageHandler
                uploader = CloudinaryImageHandler()
                uploader.delete_image(self.cloudinary_image_id)
            except Exception as e:
                # Log error but don't fail deletion
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"Failed to delete image {self.cloudinary_image_id} from Cloudinary: {str(e)}"
                )

        # Proceed with database deletion
        super().delete(*args, **kwargs)


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


# Signal handlers for automatic Cloudinary cleanup
@receiver(pre_delete, sender=BlogPostImage)
def delete_blogpost_image_from_cloudinary(sender, instance, **kwargs):
    """
    Signal handler to ensure Cloudinary images are deleted when BlogPostImage is deleted.
    This provides an extra layer of safety beyond the model's delete() method.
    """
    if instance.cloudinary_image_id:
        try:
            from app.views.helpers.cloudinary import CloudinaryImageHandler
            uploader = CloudinaryImageHandler()
            uploader.delete_image(instance.cloudinary_image_id)
            logger.info(f"Successfully deleted image {instance.cloudinary_image_id} from Cloudinary")
        except Exception as e:
            logger.warning(
                f"Signal handler failed to delete image {instance.cloudinary_image_id} "
                f"from Cloudinary: {str(e)}"
            )
