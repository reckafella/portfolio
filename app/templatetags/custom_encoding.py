from django import template
from urllib.parse import quote_plus

register = template.Library()


@register.filter
def urlencode_plus(value):
    return quote_plus(value)
