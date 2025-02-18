import re
import requests
from cloudinary.models import CloudinaryField
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse_lazy
from django.utils.text import slugify
from wagtail.fields import RichTextField
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    profile_pic = CloudinaryField('image', null=True, blank=True)
    cloudinary_image_id = models.CharField(max_length=255, blank=True, null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class SocialLinks(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='social_media')
    twitter_x = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    tiktok = models.URLField(blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    changes_notifications = models.BooleanField(default=True)
    new_products_notifications = models.BooleanField(default=True)
    marketing_notifications = models.BooleanField(default=False)
    security_notifications = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s settings"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class Projects(models.Model):
    PROJECT_TYPES = [
        ('personal', 'Personal'),
        ('professional', 'Professional'),
    ]

    title = models.CharField(unique=True, max_length=200)
    description = RichTextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='personal')
    category = models.CharField(max_length=100, choices=settings.CATEGORY_CHOICES, default='Web Development')
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
    project = models.ForeignKey(Projects, on_delete=models.PROTECT, related_name='images')
    image = CloudinaryField('image', null=True, blank=True)
    cloudinary_image_id = models.CharField(max_length=255, blank=True, null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)
    live = models.BooleanField(default=True)


class Video(models.Model):
    project = models.ForeignKey(Projects, on_delete=models.PROTECT, related_name='videos')
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
                resolutions = ['maxresdefault', '0', 'sddefault', 'hqdefault', 'mqdefault']
                for resolution in resolutions:
                    self.thumbnail_url = f'https://img.youtube.com/vi/{video_id}/{resolution}.jpg'
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

    class Meta:
        managed = True

    def __str__(self):
        return f'{self.name} - {self.subject}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def get_success_url(self):
        return reverse_lazy("app:contact")



@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile instance when a new User is created"""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the Profile instance when the User is saved"""
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)

""" create social links/settings when a user and profile are set up """
@receiver(post_save, sender=Profile)
def create_social_links(sender, instance, created, **kwargs):
    if created:
        SocialLinks.objects.create(profile=instance)
    
@receiver(post_save, sender=Profile)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance.user)

""" 
@receiver(post_save, sender=Profile)
def save_social_links(sender, instance, **kwargs):
    try:
        instance.social_media.save()
    except SocialLinks.DoesNotExist:
        SocialLinks.objects.create(profile=instance.profile)

@receiver(post_save, sender=Profile)
def save_user_settings(sender, instance, **kwargs):
    try:
        instance.user_settings.save()
    except UserSettings.DoesNotExist:
        UserSettings.objects.create(user=instance.user)
 """
