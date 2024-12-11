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
    )

    topics = forms.CharField(
        label="Relevant Topic(s)",
        required=True,
        max_length=200,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )

    content = forms.CharField(
        label="Article Content",
        required=True,
        widget=forms.Textarea(attrs={"class": "form-control"}),
    )

    cover_image = forms.ImageField(
        label="Article Cover Image",
        required=False,
        widget=forms.ClearableFileInput(attrs={"class": "form-control"}),
    )

    class Meta:
        model = BlogPostPage
        fields = ["title", "content", "cover_image", "topics"]

    def save(self, commit=True, user=None):
        """Customize save behavior to update the author and other details."""
        instance = super().save(commit=False)
        if user and not instance.author:
            instance.author = user
        if commit:
            instance.save()
        return instance
