from django import forms
from ckeditor.widgets import CKEditorWidget
from django.contrib import admin

from app.models import BlogPost


class LoginForm(forms.Form):
    """ form to handle login info """
    username = forms.CharField(label='Enter Username', required=True, max_length=30,
                                 widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Username'}))

    password = forms.CharField(label='Enter Password', required=True, min_length=8, max_length=60,
                                widget=forms.PasswordInput(attrs={
                                    'class': 'form-control', 'id': 'form3Example4cg', 'placeholder': 'Enter Password'},
                                    render_value=True))

class BlogPostForm(forms.Form):
    """ form to handle blog post info """
    title = forms.CharField(label='Title', required=True, max_length=200,
                            widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Title'}))
    
    content = forms.CharField(label='Content', required=True,
                              widget=CKEditorWidget(attrs={'class': 'form-control', 'placeholder': 'Enter Content'}))


class BlogPostAdminForm(forms.ModelForm):
    """ form to handle blog post info in admin """
    content = forms.CharField(label='Content', required=True,
                                widget=CKEditorWidget(attrs={'class': 'form-control', 'placeholder': 'Enter Content'}))
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


