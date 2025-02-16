from django import forms
from django.contrib.auth.forms import PasswordChangeForm

from app.models import Profile, SocialLinks, UserSettings


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'profile_pic', 'country', 'city', 'title']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'profile_pic': forms.FileInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'})
        }


class SocialLinksForm(forms.ModelForm):
    class Meta:
        model = SocialLinks
        exclude = ['profile', 'created_at', 'updated_at']
        widgets = {
            'twitter_x': forms.URLInput(attrs={'class': 'form-control'}),
            'facebook': forms.URLInput(attrs={'class': 'form-control'}),
            'instagram': forms.URLInput(attrs={'class': 'form-control'}),
            'linkedin': forms.URLInput(attrs={'class': 'form-control'}),
            'github': forms.URLInput(attrs={'class': 'form-control'}),
            'youtube': forms.URLInput(attrs={'class': 'form-control'}),
            'tiktok': forms.URLInput(attrs={'class': 'form-control'}),
            'website': forms.URLInput(attrs={'class': 'form-control'}),
            'whatsapp': forms.TextInput(attrs={'class': 'form-control'}),
        }


class UserPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(
        label='Old Password', required=True, min_length=8, max_length=50,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))

    new_password1 = forms.CharField(
        label='New Password', required=True, min_length=8, max_length=50,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))

    new_password2 = forms.CharField(
        label='Confirm New Password', required=True, min_length=8, max_length=50,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(user, *args, **kwargs)

    def clean_old_password(self):
        old_password = self.cleaned_data.get('old_password')
        if not self.user.check_password(old_password):
            raise forms.ValidationError('Old password is incorrect.')
        return old_password

    def clean(self):
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get('new_password1')
        new_password2 = cleaned_data.get('new_password2')
        if new_password1 and new_password2 and new_password1 != new_password2:
            raise forms.ValidationError('New passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        new_password = self.cleaned_data.get('new_password1')
        self.user.set_password(new_password)
        if commit:
            self.user.save()
        return self.user



class UserSettingsForm(forms.ModelForm):
    class Meta:
        model = UserSettings
        exclude = ['user']
        widgets = {
            'changes_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'new_products_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'marketing_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'security_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input', 'disabled': 'disabled'}),
        }
