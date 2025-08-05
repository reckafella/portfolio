import re
import requests
from cloudinary.models import CloudinaryField
from django.conf import settings
from django.db import models
from django.urls import reverse_lazy as reverse
from django.utils.text import slugify
from wagtail.fields import RichTextField


class Projects(models.Model):
    PROJECT_TYPES = settings.PROJECT_TYPES
    CATEGORY_CHOICES = settings.CATEGORY_CHOICES

    title = models.CharField(unique=True, max_length=200)
    description = RichTextField()
    project_type = models.CharField(max_length=20,
                                    choices=PROJECT_TYPES,
                                    default='personal')
    category = models.CharField(max_length=100,
                                choices=CATEGORY_CHOICES,
                                default='Web Development')
    client = models.CharField(max_length=200, default="Personal")
    project_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=100, unique=True)
    live = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        managed = True

    def __str__(self):
        return self.title

    @property
    def first_image(self):
        return self.images.first() if self.images.first() else None

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Image(models.Model):
    project = models.ForeignKey(Projects, on_delete=models.PROTECT,
                                related_name='images')
    image = CloudinaryField('image', null=True, blank=True)
    cloudinary_image_id = models.CharField(max_length=255, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)
    live = models.BooleanField(default=True)


class Video(models.Model):
    project = models.ForeignKey(Projects, on_delete=models.PROTECT,
                                related_name='videos')
    youtube_url = models.URLField(max_length=200, null=True,)
    thumbnail_url = models.URLField(max_length=200, null=True, blank=True)
    live = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.youtube_url and not self.thumbnail_url:
            video_id = None
            if 'youtu.be' in self.youtube_url:
                video_id = self.youtube_url.split('/')[-1]
            else:
                # Handle both regular and shortened YouTube URLs
                pattern = r'(?:v=|/)([a-zA-Z0-9_-]{11})(?:\?|&|$)'
                match = re.search(pattern, self.youtube_url)
                if match:
                    video_id = match.group(1)

            if video_id:
                resolutions = 'maxresdefault,0,sddefault,hqdefault,mqdefault'
                resolutions = resolutions.split(',')

                # Check each resolution in order
                for resolution in resolutions:
                    base_url = 'https://img.youtube.com/vi/'
                    self.thumbnail_url = '{}{}/{}.jpg'.format(
                        base_url, video_id, resolution
                    )

                    if requests.get(self.thumbnail_url).status_code == 200:
                        break

        super().save(*args, **kwargs)


class Message(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = RichTextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # Add this field

    def mark_as_read(self):
        self.is_read = True
        self.save()

    def dismiss(self):
        self.delete()

    class Meta:
        managed = True

    def __str__(self):
        return f'{self.name} - {self.subject}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def get_success_url(self):
        return reverse("app:contact")
