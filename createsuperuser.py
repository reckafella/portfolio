#!/usr/bin/env python3

import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
    django.setup()

    username = os.getenv('DJANGO_SUPERUSER_USERNAME')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL')

    if not username or not password or not email:
        raise ValueError('You must provide DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, and DJANGO_SUPERUSER_EMAIL environment variables')

    # Create the superuser
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superuser {username} created successfully.')
    else:
        print(f'Superuser {username} already exists.')

if __name__ == '__main__':
    main()
