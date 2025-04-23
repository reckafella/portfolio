# views.py
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy as reverse
from django.views.generic import UpdateView
from django.http import JsonResponse
from django.conf import settings


from app.models import Profile, SocialLinks, UserSettings
from app.views.helpers.helpers import handle_no_permissions
from app.forms.profile import (
    ProfileForm, SocialLinksForm,
    UserPasswordChangeForm, UserSettingsForm
)
from app.views.helpers.cloudinary import (
    CloudinaryImageHandler, handle_image_upload
)

uploader = CloudinaryImageHandler()


class ProfileView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Profile
    form_class = ProfileForm
    template_name = 'app/profile/profile_detail.html'

    def test_func(self):
        return (
            self.request.user.is_authenticated and self.request.user.profile
            ) or self.request.user.is_superuser

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
            context['password_form'] = (
                UserPasswordChangeForm(self.request.user)
            )
        if 'settings_form' not in kwargs:
            context['settings_form'] = UserSettingsForm(instance=settings)

        username = self.request.user.username.capitalize()
        active_tabs = [
            'profile-edit', 'profile-change-password', 'profile-settings'
            ]
        active_tab = self.request.session.get('active_tab', 'profile-overview')
        context['title'] = context['page_title'] = f"{username}'s Profile"
        context['active_tab'] = active_tab
        context['active_tab'] = ('profile-overview' if context['active_tab']
                                 not in active_tabs else context['active_tab'])

        return context

    def post(self, request, **_):
        if not self.test_func():
            return handle_no_permissions(
                self.request, "Not authorized to update this profile"
            )

        self.object = self.get_object()

        # Handle profile picture deletion
        if 'delete_profile_pic' in request.POST:
            return self.handle_profile_pic_deletion()

        # Determine which form was submitted based on a hidden input or\
        # button name
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
                # results of image upload
                _data = handle_image_upload(
                    instance=profile,
                    uploader=uploader,
                    image=self.request.FILES['profile_pic'],
                    folder=settings.PROFILE_FOLDER
                )
                profile.cloudinary_image_id = _data["cloudinary_image_id"]
                profile.cloudinary_image_url = _data["cloudinary_image_url"]
                profile.optimized_image_url = _data["optimized_image_url"]
            except Exception as e:
                # Handle any errors that occur during the upload
                # Log the error or notify the user
                _error_message = f"Error Uploading Image: {str(e)}"
                messages.error(self.request, _error_message)

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
            messages.success(self.request, 'Password updated successfully!')
            return redirect(self.get_success_url())

        self.request.session['active_tab'] = 'profile-change-password'

        _context_data = self.get_context_data(password_form=form)
        return self.render_to_response(_context_data)

    def handle_settings_update(self):
        _user = self.request.user
        settings, created = UserSettings.objects.get_or_create(user=_user)

        # Create a copy of the form to check which fields are disabled
        dummy_form = UserSettingsForm(instance=settings)
        disabled_fields = [name for name, field in dummy_form.fields.items()
                           if field.widget.attrs.get('disabled')]

        # Store original values for disabled fields
        original_values = {_f: getattr(settings, _f) for _f in disabled_fields}

        # Process the form
        form = UserSettingsForm(self.request.POST, instance=settings)

        if form.is_valid():
            # Save but don't commit yet
            settings_instance = form.save(commit=False)

            # Restore original values for all disabled fields
            for field, value in original_values.items():
                setattr(settings_instance, field, value)

            # Now save
            settings_instance.save()

            messages.success(self.request, 'Settings updated successfully!')
            return redirect(self.get_success_url())

        self.request.session['active_tab'] = 'profile-settings'
        _context_data = self.get_context_data(settings_form=form)
        return self.render_to_response(_context_data)

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
        """Redirect to the profile detail page after successful update"""
        _username = self.request.user.username
        return reverse('app:profile_detail', kwargs={'username': _username})
