# Generated by Django 5.0.9 on 2024-11-27 20:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_projects_project_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='projects',
            name='slug',
            field=models.SlugField(blank=True, default='', max_length=100, unique=True),
        ),
    ]