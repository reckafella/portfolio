#!/usr/bin/env python3

import os
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()

username = os.getenv('DJANGO_SUPERUSER_USERNAME')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
email = os.getenv('DJANGO_SUPERUSER_EMAIL')

if not username or not password or not email:
    raise ValueError('You must provide DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD and DJANGO_SUPERUSER_EMAIL environment variables')

if __name__ == '__main__':
    call_command('createsuperuser', interactive=False, username=username, email=email, password=password)

# This script creates a superuser in Django using the createsuperuser management command. It reads the username, password, and email from environment variables and calls the createsuperuser command with the provided values. The interactive option is set to False to prevent the command from prompting the user for input.
