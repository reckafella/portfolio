"""
Context processor to add metadata variables to templates
"""


def metadata_context(request):
    """Add metadata context variables to all templates"""
    return {
        'site_title': 'Ethan Wanyoike',
        'site_description': 'A showcase of my projects and skills',
        'default_og_image': request.build_absolute_uri(
            '/static/assets/images/og-default.jpeg')
    }
