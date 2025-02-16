# views.py
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from django.http import JsonResponse
from django.conf import settings

from app.forms.profile import (
    ProfileForm, 
    SocialLinksForm, 
    UserPasswordChangeForm, 
    UserSettingsForm
)
from app.models import Profile, SocialLinks, UserSettings
from app.views.helpers.cloudinary import CloudinaryImageHandler, handle_image_upload
from app.views.helpers.helpers import handle_no_permissions

uploader = CloudinaryImageHandler()

class ProfileView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Profile
    form_class = ProfileForm
    template_name = 'app/profile/profile_detail.html'

    def test_func(self):
        return (self.request.user.is_authenticated and self.request.user.profile) or self.request.user.is_superuser

    def get_object(self):
        profile = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={"user": self.request.user,
                      "bio": f"This is {self.request.user}'s bio"
                    })[0]
        return profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add forms for all tabs
        social_links = SocialLinks.objects.get_or_create(
            profile=self.object,
            defaults={}
        )[0]
        settings = UserSettings.objects.get_or_create(
            user=self.request.user,
            defaults={
                'changes_notifications': True,
                'new_products_notifications': True,
                'marketing_notifications': False,
                'security_notifications': True
            }
        )[0]

        if 'social_form' not in kwargs:
            context['social_form'] = SocialLinksForm(instance=social_links)
        if 'password_form' not in kwargs:
            context['password_form'] = UserPasswordChangeForm(self.request.user)
        if 'settings_form' not in kwargs:
            context['settings_form'] = UserSettingsForm(instance=settings)
            
        context['title'] = f"{self.request.user.username.capitalize()}'s Profile"
        context['active_tab'] = self.request.session.get('active_tab', 'profile-overview')
        context['active_tab'] = 'profile-overview' if context['active_tab'] not in ['profile-edit', 'profile-change-password', 'profile-settings'] else context['active_tab']
        context['page_title'] = f"{self.request.user.username.capitalize()}'s Profile"
        return context

    def post(self, request, **_):
        if not self.test_func():
            return handle_no_permissions(self.request, "You are not authorized to update this profile")

        self.object = self.get_object()
        
        # Handle profile picture deletion
        if 'delete_profile_pic' in request.POST:
            return self.handle_profile_pic_deletion()

        # Determine which form was submitted based on a hidden input or button name
        form_type = request.POST.get('form_type')
        
        if form_type == 'profile':
            return self.handle_profile_update()
        elif form_type == 'password':
            return self.handle_password_change()
        elif form_type == 'settings':
            return self.handle_settings_update()
        
        # Default to profile form if no form type specified
        return self.handle_profile_update()

    def handle_profile_update(self):
        form = self.get_form()
        social_form = SocialLinksForm(self.request.POST)
        
        if form.is_valid() and social_form.is_valid():
            return self.handle_valid_profile_forms(form, social_form)
        
        self.request.session['active_tab'] = 'profile-edit'
        return self.form_invalid(form)

    def handle_valid_profile_forms(self, form, social_form):
        profile = form.save(commit=False)
        
        # Handle profile picture upload
        if 'profile_pic' in self.request.FILES:
            try:
                image_data = handle_image_upload(
                    instance=profile,
                    uploader=uploader,
                    image=self.request.FILES['profile_pic'],
                    folder=settings.PROFILE_FOLDER
                )
                profile.cloudinary_image_id = image_data["cloudinary_image_id"]
                profile.cloudinary_image_url = image_data["cloudinary_image_url"]
                profile.optimized_image_url = image_data["optimized_image_url"]
            except Exception as e:
                messages.error(self.request, f"Error uploading profile picture: {str(e)}")
                return self.form_invalid(form)

        profile.save()

        # Update or create social links
        social_links = SocialLinks.objects.get_or_create(profile=profile)[0]
        for field, value in social_form.cleaned_data.items():
            setattr(social_links, field, value)
        social_links.save()

        messages.success(self.request, 'Profile updated successfully!')
        return redirect(self.get_success_url())

    def handle_password_change(self):
        form = UserPasswordChangeForm(self.request.user, self.request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(self.request, user)
            messages.success(self.request, 'Your password was successfully updated!')
            return redirect(self.get_success_url())
        
        self.request.session['active_tab'] = 'profile-change-password'
        return self.render_to_response(self.get_context_data(password_form=form))
    def handle_settings_update(self):
        settings = UserSettings.objects.get_or_create(user=self.request.user)[0]
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        form = UserSettingsForm(self.request.POST, instance=settings)
        
        if form.is_valid():
            form.save()
            messages.success(self.request, 'Settings updated successfully!')
            return redirect(self.get_success_url())
        
        self.request.session['active_tab'] = 'profile-settings'
        return self.render_to_response(self.get_context_data(settings_form=form))

    def handle_profile_pic_deletion(self):
        if self.object.cloudinary_image_id:
            try:
                uploader.delete_image(self.object.cloudinary_image_id)
                self.object.profile_pic = None
                self.object.cloudinary_image_id = None
                self.object.cloudinary_image_url = None
                self.object.optimized_image_url = None
                self.object.save()
                return JsonResponse({
                    "success": True,
                    "message": "Profile picture deleted successfully!"
                })
            except Exception as e:
                return JsonResponse({
                    "success": False,
                    "error": f"Error deleting profile picture: {str(e)}"
                }, status=400)
        return JsonResponse({
            "success": False,
            "error": "No profile picture to delete"
        }, status=400)

    def get_success_url(self):
        return reverse_lazy('app:profile_detail', kwargs={'username': self.request.user.username})
