"""
forms to allow users create/update blog posts
"""
from django import forms
#from wagtail.admin.rich_text import DraftailRichTextArea
from wagtail.blocks import RichTextBlock

from blog.models import BlogPostPage


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
    published = forms.BooleanField(
        label="Publish Article",
        required=False,
        widget=forms.CheckboxInput(attrs={"class": "form-check-input"}),
        help_text="Check this box to publish the article",
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

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get("title")
        content = cleaned_data.get("content")
        topics = cleaned_data.get("topics")
        if not title or not content or not topics:
            raise forms.ValidationError("Please fill in all required fields")
        return cleaned_data


class BlogPostAdminForm(forms.ModelForm):
    """
    Form for admins to update blog posts
    """
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
    content = RichTextBlock(
        label="Article Content",
        required=True,
        features="full",
        #widget=DraftailRichTextArea(attrs={"class": "form-control"}),
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

    def save(self, commit=True):
        """Customize save behavior to update the author and other details."""
        instance = super().save(commit=False)
        if commit:
            instance.save()
        return instance

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get("title")
        content = cleaned_data.get("content")
        topics = cleaned_data.get("topics")
        if not title or not content or not topics:
            raise forms.ValidationError("Please fill in all required fields")
        return cleaned_data
