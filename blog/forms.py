"""
Forms to allow users create/update blog posts
"""
from django import forms
# from wagtail.admin.rich_text import DraftailRichTextArea
from django.contrib import admin

from wagtail.admin.widgets.tags import AdminTagWidget
from taggit.forms import TagField

from blog.models import BlogPostPage
from blog.form_utils.fields import DraftailFormField


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

    """ content = PlainTextFormField(
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
    ) """

    content = DraftailFormField(
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

    cover_image = forms.FileField(
        label="Article Cover Image",
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control",
                                      "type": "file",
                                      "accept": "image/*",
                                      "placeholder": "Upload cover image",
                                      "multiple": False}),
        help_text="Upload the cover image for this article",
    )

    tags = TagField(
        label="Article Tags",
        required=False,
        widget=AdminTagWidget(attrs={"class": "form-control"}),
        help_text=(
            "Add tags to your article. Tags help categorize your content."
        )
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
