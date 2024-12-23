from django.db import models
#use django richtext field
from django.urls import reverse_lazy
from wagtail.fields import RichTextField
from django.utils.text import slugify


class Projects(models.Model):
    title = models.CharField(unique=True, max_length=200)
    description = RichTextField()
    cloudinary_image_id = models.CharField(max_length=255, blank=True, null=True)
    project_url = models.URLField(blank=True, null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        managed = True

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Message(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = RichTextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True

    def __str__(self):
        return f'{self.name} - {self.subject}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def get_success_url(self):
        return reverse_lazy("app:contact")
