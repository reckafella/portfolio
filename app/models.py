from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
#from ckeditor_uploader_5.fields import RichTextUploadingField
from django_ckeditor_5.fields import CKEditor5Field


class Topic(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    slug = models.SlugField(unique=True, max_length=200, blank=True)
    content = CKEditor5Field()
    topics = models.CharField(max_length=200, default='all', help_text="Comma-separated list of topics")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_topics(self):
        return [topic.strip() for topic in self.topics.split(',')]

class Projects(models.Model):
    title = models.CharField(unique=True, max_length=200)
    description = models.TextField()
    image = models.CharField(max_length=255)
    url = models.URLField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)