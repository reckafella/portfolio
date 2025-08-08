#!/usr/bin/env python3

import os

import django


def fix_project_slug():
    # Set the Django settings module environment variable
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

    # Initialize Django
    django.setup()

    # Import Django models after setting up Django
    from django.contrib.auth.models import Group, Permission, User
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.sites.models import Site

    # Retrieve superuser credentials from environment variables
    # these are set directly for local development

    username = os.getenv("DJANGO_SUPERUSER_USERNAME", "ethan")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "@100/Chem")
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "")

    # Create superuser if it doesn't exist
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = User.objects.create_superuser(
            username=username,
            password=password,
            email=email
        )
    user.is_superuser = True
    user.is_staff = True
    user.save()

    # Create a site object
    site_name = os.getenv("DJANGO_SITE_NAME", "localhost")
    site_domain = os.getenv("DJANGO_SITE_DOMAIN", "localhost")
    site_id = os.getenv("DJANGO_SITE_ID", 1)
    site = Site.objects.create(
        id=site_id,
        name=site_name,
        domain=site_domain
    )
    site.save()

    # Create a group object
    group_name = os.getenv("DJANGO_GROUP_NAME", "admin")
    group, created = Group.objects.get_or_create(name=group_name)
    if created:
        print(f"Group '{group_name}' created.")
    else:
        print(f"Group '{group_name}' already exists.")
    group.user_set.add(user)
    group.save()
    print(f"User '{username}' added to group '{group_name}'.")

    # Create a content type object
    content_type_name = os.getenv("DJANGO_CONTENT_TYPE_NAME", "app")
    content_type_app_label = os.getenv("DJANGO_CONTENT_TYPE_APP_LABEL", "app")
    content_type_model = os.getenv("DJANGO_CONTENT_TYPE_MODEL", "projects")
    content_type, created = ContentType.objects.get_or_create(
        app_label=content_type_app_label,
        model=content_type_model
    )
    if created:
        print(f"Content type '{content_type_name}' created.")
    else:
        print(f"Content type '{content_type_name}' already exists.")
    content_type.save()
    print(f"Content type '{content_type_name}' saved.")

    # Create a permission object
    permission_name = os.getenv("DJANGO_PERMISSION_NAME",
                                "can_add_project")
    permission_codename = os.getenv("DJANGO_PERMISSION_CODENAME",
                                    "add_project")
    permission_content_type = os.getenv(
        "DJANGO_PERMISSION_CONTENT_TYPE", "app"
    )
    permission, created = Permission.objects.get_or_create(
        codename=permission_codename,
        name=permission_name,
        content_type=permission_content_type
    )
    if created:
        print(f"Permission '{permission_name}' created.")
    else:
        print(f"Permission '{permission_name}' already exists.")

    permission.save()
    print(f"Permission '{permission_name}' saved.")
    # Add permission to group
    group.permissions.add(permission)
    group.save()
    print(f"Permission '{permission_name}' added to group '{group_name}'.")
    # Add permission to user
    user.user_permissions.add(permission)
    user.save()
    print(f"Permission '{permission_name}' added to user '{username}'.")
    # Add permission to site
    site.permissions.add(permission)
    site.save()
    print(f"Permission '{permission_name}' added to site '{site_name}'.")
    # Add permission to content type
    content_type.permissions.add(permission)
    content_type.save()
    print(f"Permission '{permission_name}' added to content type\
          '{content_type_name}'.")
    # Add permission to group
    group.permissions.add(permission)
    group.save()
    print(f"Permission '{permission_name}' added to group '{group_name}'.")


if __name__ == "__main__":
    fix_project_slug()
