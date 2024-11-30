#!/usr/bin/env python3

import os

import django


def create_superuser():
    # Set the Django settings module environment variable
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')

    # Initialize Django
    django.setup()

    # Import Django models after setting up Django
    from django.contrib.auth.models import User

    # Retrieve superuser credentials from environment variables
    # these are set directly for local development

    username = 'ethan' # os.getenv('DJANGO_SUPERUSER_USERNAME')
    password = '@100/Chem' # os.getenv('DJANGO_SUPERUSER_PASSWORD')
    email = 'ethan@admin.com' #os.getenv('DJANGO_SUPERUSER_EMAIL')

    # Check if credentials are provided
    if not username or not password or not email:
        raise ValueError('You must provide DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, and DJANGO_SUPERUSER_EMAIL environment variables')

    # Create the superuser if it doesn't already exist
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superuser {username} created successfully.')
    else:
        print(f'Superuser {username} already exists.')

if __name__ == '__main__':
    create_superuser()
