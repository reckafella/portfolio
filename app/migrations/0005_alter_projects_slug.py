# Generated by Django 5.0.9 on 2024-11-27 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0004_projects_slug"),
    ]

    operations = [
        migrations.AlterField(
            model_name="projects",
            name="slug",
            field=models.SlugField(
                blank=True, default="djangodbmodelsfieldscharfield", max_length=100
            ),
        ),
    ]
