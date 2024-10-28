from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from app.models import Projects, Message


class LoginForm(forms.Form):
    """ form to handle login info """
    username = forms.CharField(label='Username', required=True, max_length=30,
                                 widget=forms.TextInput(attrs={'class': 'form-control'}))

    password = forms.CharField(label='Enter Password', required=True, min_length=8, max_length=60,
                                widget=forms.PasswordInput(attrs={
                                    'class': 'form-control', 'id': 'password1'},
                                    render_value=True))


class SignupForm(UserCreationForm):
    """ form to handle register info """
    username = forms.CharField(label='Username',
                               required=True, max_length=30,
                               widget=forms.TextInput(attrs={'class': 'form-control'}))

    first_name = forms.CharField(label='First Name',
                                 required=True, max_length=30, 
                                 widget=forms.TextInput(attrs={'class': 'form-control'}))

    last_name = forms.CharField(label='Last Name',
                                required=True, max_length=30,
                                widget=forms.TextInput(attrs={'class': 'form-control'}))

    email = forms.EmailField(label='Email', required=True,
                             widget=forms.EmailInput(attrs={'class': 'form-control'}))

    password1 = forms.CharField(label='Password',
                               required=True, min_length=8, max_length=60,
                                widget=forms.PasswordInput(attrs={
                                    'class': 'form-control', 'id': 'password1'},
                                    render_value=True))
    password2 = forms.CharField(label='Confirm Password',
                                       required=True, min_length=8, max_length=60,
                                       widget=forms.PasswordInput(attrs={
                                           'class': 'form-control', 'id': 'password2'},
                                           render_value=True))
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2']
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 != password2:
            raise forms.ValidationError('Passwords do not match')
        return cleaned_data
    
    def save(self, commit=True):
        user = super(SignupForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.username = self.cleaned_data['username']
        
        if commit:
            user.save()
        return user


class ProjectsForm(forms.ModelForm):
    """ form to handle project info """
    class Meta:
        model = Projects
        fields = '__all__' # ['title', 'description', 'image', 'url']
    
    title = forms.CharField(label='Title', required=True, max_length=200,
                            widget=forms.TextInput(attrs={'class': 'form-control'}))
    description = forms.CharField(label='Description', required=True,
                                  widget=forms.Textarea(attrs={'class': 'form-control'}))
    image = forms.CharField(label='Image path', required=True,
                            widget=forms.TextInput(attrs={'class': 'form-control'}))
    url = forms.URLField(label='URL', required=True,
                            widget=forms.URLInput(attrs={'class': 'form-control'}))


class ProjectsAdminForm(forms.ModelForm):
    """ form to handle project info in admin """
    description = forms.CharField(label='Description', required=True,
                                  widget=forms.Textarea(attrs={'class': 'form-control'}))
    class Meta:
        model = Projects
        fields = '__all__'


class ProjectsAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)


class ContactForm(forms.Form):
    """ form to handle contact info """
    name = forms.CharField(label='Name', required=True, max_length=100,
                            widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'name-field', 'name': 'name'}))
    email = forms.EmailField(label='Email', required=True,
                            widget=forms.EmailInput(attrs={'class': 'form-control', 'id': 'email-field', 'name': 'email'}))
    subject = forms.CharField(label='Subject', required=True, max_length=200,
                            widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'subject-field', 'name': 'subject'}))
    message = forms.CharField(label='Message', required=True,
                              widget=forms.Textarea(attrs={'class': 'form-control', 'id': 'message-field', 'name': 'message', 'rows': 5}))
    
    class Meta:
        model = Message
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        email = cleaned_data.get('email')
        subject = cleaned_data.get('subject')
        message = cleaned_data.get('message')
        if not name or not email or not message:
            raise forms.ValidationError('All fields are required')
        return cleaned_data
    
    def save(self, commit=True):
        message = Message()
        message.name = self.cleaned_data['name']
        message.email = self.cleaned_data['email']
        message.subject = self.cleaned_data['subject']
        message.message = self.cleaned_data['message']
        
        if commit:
            message.save()
        return message


class ContactFormAdminForm(admin.ModelAdmin):
    """ form to handle contact info in admin """
    class Meta:
        model = Message
        fields = '__all__'
