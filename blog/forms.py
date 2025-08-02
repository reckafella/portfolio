"""
Forms to allow users create/update blog posts
"""
from django import forms
# from wagtail.admin.rich_text import DraftailRichTextArea
from wagtail.rich_text import RichText
from django.utils.html import strip_tags
import html
from django.contrib import admin

from blog.models import BlogPostPage


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


class BlogPostForm(forms.ModelForm):
    """
    Form for authors to update their blog posts
    """
    title = forms.CharField(
        label="Article Title",
        required=True,
        max_length=200,
        widget=forms.TextInput(attrs={"class": "form-control"}),
        help_text="Enter the title of your article",
    )

    content = PlainTextFormField(
        label="Article Content",
        required=True,
        widget=forms.Textarea(attrs={
            'cols': 80,
            'rows': 20,
            'class': 'form-control'
        }),
        help_text=("Write your article content using the rich text editor. "
                   "Use the toolbar to format text, add headings, "
                   "create lists, add links, and more. The editor shows "
                   "exactly how your content will appear to readers.")
    )

    cover_image = forms.ImageField(
        label="Article Cover Image",
        required=False,
        widget=forms.ClearableFileInput(attrs={"class": "form-control"}),
        help_text="Upload the cover image for this article",
    )

    published = forms.BooleanField(
        label="Publish Article",
        required=False,
        widget=forms.CheckboxInput(attrs={
            "class": "form-check-input",
            "role": "switch"
            }),
        help_text="Check this box to publish the article",
    )

    class Meta:
        model = BlogPostPage
        fields = ["title", "content", "cover_image", "tags", "published"]

    def save(self, commit=True, user=None):
        """Customize save behavior to update the author and other details."""
        instance = super().save(commit=False)
        if user and not instance.author:
            instance.author = user
        if commit:
            instance.save()
            self.save_m2m()

        return instance

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get("title")
        content = cleaned_data.get("content")

        if not title or not content:
            _m = "Fill in all required fields (title and content)."
            raise forms.ValidationError(_m)
        return cleaned_data


class BlogPostAdminForm(admin.ModelAdmin):
    """
    Form for admins to update blog posts
    """
    class Meta:
        model = BlogPostPage
        fields = "__all__"
