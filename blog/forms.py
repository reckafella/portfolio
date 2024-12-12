"""
forms to allow users create/update blog posts
"""

from django import forms
from blog.models import BlogPostPage


class BlogPostForm(forms.ModelForm):
    """Form for authors to update their blog posts"""

    title = forms.CharField(
        label="Article Title",
        required=True,
        max_length=200,
        widget=forms.TextInput(attrs={"class": "form-control"}),
        help_text="Enter the title of your article",
    )

    topics = forms.CharField(
        label="Relevant Topic(s)",
        required=True,
        max_length=200,
        widget=forms.TextInput(attrs={"class": "form-control"}),
        help_text="Separate topics with commas (,)",
    )

    content = forms.CharField(
        label="Article Content",
        required=True,
        widget=forms.Textarea(attrs={"class": "form-control"}),
        help_text="Write the content of your article here",
    )

    cover_image = forms.ImageField(
        label="Article Cover Image",
        required=False,
        widget=forms.ClearableFileInput(attrs={"class": "form-control"}),
        help_text="Upload an image to be used as the cover image for this article",
    )

    class Meta:
        model = BlogPostPage
        fields = ["title", "content", "topics", "cover_image"]

    def save(self, commit=True, user=None):
        """Customize save behavior to update the author and other details."""
        instance = super().save(commit=False)
        if user and not instance.author:
            instance.author = user
        if commit:
            instance.save()
        return instance
