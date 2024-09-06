from django.db import models
from django.utils.text import slugify
from ckeditor.fields import CKEditor5Field
from django.contrib.auth.models import User


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    slug = models.SlugField(unique=True, max_length=200, blank=True)
    content = CKEditor5Field()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title