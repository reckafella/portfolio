# Generated by Django 5.0.9 on 2024-11-27 20:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_alter_projects_slug'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='projects',
            name='slug',
        ),
    ]