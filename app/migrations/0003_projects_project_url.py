# Generated by Django 5.0.9 on 2024-11-27 19:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_rename_url_projects_cloudinary_image_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='projects',
            name='project_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
