from django.contrib.auth.models import User

from authentication.models import Profile
from django.conf import settings

"""
Context processor to add metadata variables to templates
"""


def metadata_context(request):
    """Add metadata context variables to all templates"""
    admin_user = User.objects.get(is_superuser=True, username='ethan')
    return {
        'site_title': admin_user.get_full_name(),
        'site_description': 'A showcase of my projects and skills',
        'default_og_image': request.build_absolute_uri(
            '/static/assets/images/og-default.jpeg')
    }


def admin_profile(request):
    """Add admin profile context variables to templates"""
    try:
        admin_user = User.objects.get(is_superuser=True, username='ethan')
        admin_profile = Profile.objects.get(user=admin_user)
        admin_image = admin_profile.optimized_image_url or None
        admin_socials = admin_profile.social_media.first() or None
        return {
            'admin_name': admin_user.get_full_name(),
            'admin_email': admin_user.email,
            'admin_bio': admin_profile.bio,
            'admin_image': admin_image,
            'admin_socials': admin_socials
        }
    except (User.DoesNotExist, Profile.DoesNotExist):
        return {}


def our_services(request):
    """Add our services context variables to templates"""
    return {
        'our_services': settings.OUR_SERVICES
    }
