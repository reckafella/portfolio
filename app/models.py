from django.db import models
from django_ckeditor_5.fields import CKEditor5Field as CK


class Projects(models.Model):
    title = models.CharField(unique=True, max_length=200)
    description = CK()
    cloudinary_image_id = models.CharField(max_length=255)
    project_url = models.URLField(blank=True, null=True)
    cloudinary_image_url = models.URLField(max_length=255)
    optimized_image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(
        max_length=100, blank=True, default="djangodbmodelsfieldscharfield"
    )
    # author_id = models.IntegerField()

    class Meta:
        managed = True

    def __str__(self):
        return self.title


class Message(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = CK()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
