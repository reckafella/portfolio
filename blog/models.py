from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.urls import reverse
from django_ckeditor_5.fields import CKEditor5Field


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200, blank=False)
    content = CKEditor5Field()
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    topics = models.CharField(max_length=200, default='all', help_text="Comma-separated list of topics")
    cover_image = models.ImageField(blank=True, null=True)

    # cloudinary IMAGE FIELDS
    cloudflare_image_id = models.CharField(max_length=200, blank=True, null=True)
    cloudflare_image_url = models.URLField(blank=True, null=True)

    class Meta:
        managed = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={'slug': self.slug})

    def get_topics(self):
        return [topic.strip() for topic in self.topics.split(',')]
