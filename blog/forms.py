from django import forms
from django.contrib import admin
from django_ckeditor_5.widgets import CKEditor5Widget

from blog.models import BlogPost


class BlogPostForm(forms.ModelForm):
    """ form to handle blog post info """
    title = forms.CharField(label='Article Title', required=True, max_length=200,
                            widget=forms.TextInput(attrs={'class': 'form-control'}))

    topics = forms.CharField(label='Relevant Topic(s)', required=True, max_length=200,
                            widget=forms.TextInput(attrs={'class': 'form-control'}))

    content = forms.CharField(label='Article Content', required=True,
                              widget=CKEditor5Widget(attrs={'class': 'form-control'}))

    published = forms.BooleanField(label='Publish', required=False,
                                      widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}))

    cover_image = forms.ImageField(label='Article Cover Image', required=False,
                                   widget=forms.FileInput(attrs={'class': 'form-control'}))

    class Meta:
        model = BlogPost
        fields = ['title', 'content', 'cover_image', 'topics', 'published']



"""  """
class BlogPostAdminForm(forms.ModelForm):
    """ form to handle blog post info in admin """
    content = forms.CharField(label='Content', required=True,
                                widget=CKEditor5Widget(attrs={'class': 'form-control'}))
    class Meta:
        model = BlogPost
        fields = '__all__'
        

class BlogPostAdmin(admin.ModelAdmin):
    form = BlogPostAdminForm
    list_display = ('title', 'author', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('created_at', 'author')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)
