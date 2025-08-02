"""
Custom form fields for handling Wagtail rich text content
"""
from django import forms
from django.forms.widgets import Textarea
from wagtail.rich_text import RichText
from django.utils.html import strip_tags
import html


class RichTextFormField(forms.CharField):
    """
    Custom form field that properly handles Wagtail RichText content
    """
    def __init__(self, *args, **kwargs):
        # Set default widget if none provided
        if 'widget' not in kwargs:
            kwargs['widget'] = forms.Textarea(attrs={
                'class': 'form-control rich-text-editor',
                'rows': 10
            })
        super().__init__(*args, **kwargs)

    def prepare_value(self, value):
        """
        Convert RichText object to HTML string for editing
        """
        if isinstance(value, RichText):
            return value.source
        return value

    def to_python(self, value):
        """
        Convert the form input back to appropriate format
        """
        if value in self.empty_values:
            return ""
        return str(value)


class PlainTextFormField(forms.CharField):
    """
    Form field that converts rich text to plain text for simple editing
    """
    def __init__(self, *args, **kwargs):
        if 'widget' not in kwargs:
            kwargs['widget'] = forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 10
            })
        super().__init__(*args, **kwargs)

    def prepare_value(self, value):
        """
        Convert RichText to plain text for editing
        """
        if isinstance(value, RichText):
            # Convert to HTML first, then strip tags
            html_content = str(value)
            # Unescape HTML entities and strip tags
            plain_text = html.unescape(strip_tags(html_content))
            return plain_text
        elif value:
            # If it's already HTML string, strip tags
            return html.unescape(strip_tags(str(value)))
        return value

    def to_python(self, value):
        """
        Convert plain text back to HTML (basic formatting)
        """
        if value in self.empty_values:
            return ""

        # Convert plain text to basic HTML with paragraph tags
        lines = str(value).strip().split('\n')
        html_lines = []

        for line in lines:
            line = line.strip()
            if line:
                # Escape HTML characters and wrap in paragraph tags
                escaped_line = html.escape(line)
                html_lines.append(f'<p>{escaped_line}</p>')

        return '\n'.join(html_lines) if html_lines else ''


class SimpleRichTextWidget(Textarea):
    """
    A simple widget with basic rich text editing capabilities
    """
    template_name = 'blog/widgets/simple_richtext.html'

    class Media:
        css = {
            'all': ('blog/css/simple-richtext.css',)
        }
        js = ('blog/js/simple-richtext.js',)

    def __init__(self, attrs=None):
        default_attrs = {
            'class': 'form-control simple-richtext-editor',
            'rows': 10,
            'data-editor': 'simple-richtext'
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)
