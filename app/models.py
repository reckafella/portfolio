import re

import requests
from cloudinary.models import CloudinaryField
from django.conf import settings
from django.db import models
from django.urls import reverse_lazy
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
    live = models.BooleanField(default=True)  # type: ignore[call-arg]

    class Meta:
        ordering = ['-created_at']
        managed = True

    def __str__(self):
        return str(self.title)

    @property
    def first_image(self):
        return self.images.first() if self.images.first() else None  # type: ignore[attr-defined]

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
    live = models.BooleanField(default=True)  # type: ignore[call-arg]


class Video(models.Model):
    project = models.ForeignKey(Projects, on_delete=models.PROTECT,
                                related_name='videos')
    youtube_url = models.URLField(max_length=200, null=True,)
    thumbnail_url = models.URLField(max_length=200, null=True, blank=True)
    live = models.BooleanField(default=True)  # type: ignore[call-arg]

    def save(self, *args, **kwargs):
        if self.youtube_url and not self.thumbnail_url:
            video_id = None
            if 'youtu.be' in str(self.youtube_url):
                video_id = str(self.youtube_url).split('/')[-1]
            else:
                # Handle both regular and shortened YouTube URLs
                pattern = r'(?:v=|/)([a-zA-Z0-9_-]{11})(?:\?|&|$)'
                match = re.search(str(pattern), str(self.youtube_url))
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
    is_read = models.BooleanField(default=False)  # type: ignore[call-arg]

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
        return reverse_lazy("app:contact")


class Profile(models.Model):
    """Singleton model for personal profile information"""
    name = models.CharField(max_length=100, default="Ethan Wanyoike")
    title = models.CharField(max_length=100, default="Software Engineer")
    location = models.CharField(max_length=100, default="Nairobi, Kenya")
    email = models.EmailField(default="ethanmuthoni@gmail.com")
    phone = models.CharField(max_length=20, blank=True)
    summary = models.TextField(default=(
        "A software engineer with a passion for building scalable applications and improving user "
        "experiences. Experienced in both frontend and backend development, and always eager to "
        "learn new technologies and improve my skills."
    ))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"
        managed = True

    def __str__(self):
        return f"{self.name} - {self.title}"

    def save(self, *args, **kwargs):
        # Ensure only one profile instance exists
        if not self.pk and Profile.objects.exists():  # type: ignore[attr-defined]
            raise ValueError(
                "Only one profile can exist. Please edit the existing profile."
            )
        super().save(*args, **kwargs)


class Education(models.Model):
    """Education entries for the about page"""
    degree = models.CharField(max_length=200)
    start_date = models.DateField(
        help_text="Start date of education", default='2020-01-01'
    )
    end_date = models.DateField(
        null=True, blank=True,
        help_text="End date of education (leave blank if currently studying)"
    )
    is_current = models.BooleanField(
        default=False,  # type: ignore[call-arg]
        help_text="Check if currently studying here")
    institution = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(
        default=0,  # type: ignore[call-arg]
        help_text="Order of display (lower numbers appear first)"
    )
    is_active = models.BooleanField(default=True)  # type: ignore[call-arg]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def period(self):
        """Generate period string from dates"""
        if self.is_current or not self.end_date:
            return f"{self.start_date.strftime('%b. %Y')} - Present"  # type: ignore[attr-defined]
        else:
            return (
                f"{self.start_date.strftime('%b. %Y')}" +  # type: ignore[attr-defined]
                f" - {self.end_date.strftime('%b. %Y')}"  # type: ignore[attr-defined]
            )

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Education"
        verbose_name_plural = "Education"
        managed = True

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Experience(models.Model):
    """Work experience entries for the about page"""
    ICON_CHOICES = [
        ('building', 'Building/Company'),
        ('laptop', 'Laptop/Remote'),
        ('graph-up', 'Analytics/Data'),
        ('code-slash', 'Development'),
        ('globe', 'Global/International'),
    ]

    title = models.CharField(max_length=200)
    start_date = models.DateField(help_text="Start date of employment",
                                  default='2020-01-01')
    end_date = models.DateField(
        null=True, blank=True,
        help_text="End date of employment (leave blank if currently working)"
    )
    is_current = models.BooleanField(
        default=False,  # type: ignore[call-arg]
        help_text="Check if currently working here"
    )
    company = models.CharField(max_length=200)
    icon_type = models.CharField(
        max_length=20, choices=ICON_CHOICES, default='building'
    )
    responsibilities = models.JSONField(
        help_text="List of responsibilities as JSON array",
        default=list
    )
    order = models.PositiveIntegerField(
        default=0,  # type: ignore[call-arg]
        help_text="Order of display (lower numbers appear first)"
    )
    is_active = models.BooleanField(default=True)  # type: ignore[call-arg]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def period(self):
        """Generate period string from dates"""
        if self.is_current or not self.end_date:
            return (f"{self.start_date.strftime('%b. %Y')}" +  # type: ignore[attr-defined]
                    "- Present")
        else:
            return (f"{self.start_date.strftime('%b. %Y')}" +  # type: ignore[attr-defined]
                    f"- {self.end_date.strftime('%b. %Y')}")  # type: ignore[attr-defined]

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Experience"
        verbose_name_plural = "Experience"
        managed = True

    def __str__(self):
        return f"{self.title} at {self.company}"


class Skill(models.Model):
    """Individual skills for the about page"""
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional category grouping (e.g., 'Programming Languages', 'Frameworks')"
    )
    proficiency_level = models.IntegerField(
        choices=[(1, 'Beginner'), (2, 'Intermediate'), (3, 'Advanced'), (4, 'Expert')],
        default=3  # type: ignore[call-arg]
    )
    order = models.PositiveIntegerField(
        default=0,  # type: ignore[call-arg]
        help_text="Order of display (lower numbers appear first)"
    )
    is_active = models.BooleanField(default=True)  # type: ignore[call-arg]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        managed = True

    def __str__(self):
        return str(self.name)
