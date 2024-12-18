# Generated by Django 5.0.9 on 2024-10-29 15:14

import cloudflare_images.field
import django.db.models.deletion
import django_ckeditor_5.fields
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BlogPost",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("slug", models.SlugField(max_length=200, unique=True)),
                (
                    "content",
                    django_ckeditor_5.fields.CKEditor5Field(blank=True, null=True),
                ),
                ("published", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "topics",
                    models.CharField(
                        default="all",
                        help_text="Comma-separated list of topics",
                        max_length=200,
                    ),
                ),
                (
                    "cover_image",
                    cloudflare_images.field.CloudflareImagesField(
                        blank=True,
                        default="NULL",
                        null=True,
                        upload_to="",
                        variant="public",
                    ),
                ),
                (
                    "cloudflare_image_id",
                    models.CharField(
                        blank=True, default="NULL", max_length=200, null=True
                    ),
                ),
                (
                    "cloudflare_image_url",
                    models.URLField(blank=True, default="NULL", null=True),
                ),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="blog_posts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Blog Post",
                "managed": True,
            },
        ),
    ]
