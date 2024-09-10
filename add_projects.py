#!/usr/bin/env python3

import json
import os
import django
from django.conf import settings
from titlecase import titlecase

def add_projects():
    # Set the Django settings module environment variable
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')

    # Initialize Django
    django.setup()

    # Import Django models after setting up Django
    from app.models import Projects

    # Create projects
    json_file_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'projects.json')

    with open(json_file_path, 'r') as fl:
        projects_data = json.load(fl)

    for project in projects_data:
        project['title'] = titlecase(project['title'])
        project['description'] = titlecase(project['description'])
        project['image'] = project['image'].replace('app/', '')
        project['url'] = project['url'].replace('app/', '')

        Projects.objects.create(**project)

if __name__ == '__main__':
    add_projects()