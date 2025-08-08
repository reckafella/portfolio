from django import template
from django.utils.html import strip_tags

register = template.Library()


@register.filter
def get_first_rich_text(stream_content):
    """
    Extract the first rich text block from StreamField content
    """
    if not stream_content:
        return ""

    for block in stream_content:
        if block.block_type == "rich_text":
            content = strip_tags(str(block.value))
            return content[:150] + "..." if len(content) > 150 else content

    return ""


@register.filter
def get_excerpt(post):
    """
    Get excerpt from post using the content fallback hierarchy
    """
    # Try stream_content first
    if hasattr(post, 'stream_content') and post.stream_content:
        excerpt = get_first_rich_text(post.stream_content)
        if excerpt:
            return excerpt

    # Fallback to content field
    if hasattr(post, 'content') and post.content:
        content = strip_tags(str(post.content))
        return content[:150] + "..." if len(content) > 150 else content

    # Fallback to legacy_content
    if hasattr(post, 'legacy_content') and post.legacy_content:
        content = strip_tags(str(post.legacy_content))
        return content[:150] + "..." if len(content) > 150 else content

    return "No excerpt available."
