#!/usr/bin/env python3

import os
import django


def fix_project_slug():
    # Set the Django settings module environment variable
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

    # Initialize Django
    django.setup()

    # Import Django models after setting up Django
    from django.contrib.auth.models import User
    from django.contrib.sites.models import Site
    from django.contrib.auth.models import Group
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.auth.models import Permission
    from django.contrib.auth.models import Group

    # Retrieve superuser credentials from environment variables
    # these are set directly for local development

    username = os.getenv("DJANGO_SUPERUSER_USERNAME", "ethan")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "@100/Chem")
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "
