from django.conf import settings
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.http import JsonResponse
from django.shortcuts import redirect

# App Specific Imports
from app.views.helpers.cloudinary import (CloudinaryImageHandler,
                                          handle_image_upload)
from app.views.helpers.helpers import handle_no_permissions, is_ajax
from authentication.forms.profile import (SocialLinksForm,
                                          UserPasswordChangeForm,
                                          UserSettingsForm)
from authentication.models import SocialLinks, UserProfileImage, UserSettings

from .base import BaseProfileView

uploader = CloudinaryImageHandler()


class ProfileView(BaseProfileView):
    def post(self, request, **_):
        if not self.test_func():
            return handle_no_permissions(
                self.request, "Not authorized to update this profile"
            )

        self.object = self.get_object()

        # Handle profile picture deletion
        if 'delete_profile_pic' in request.POST:
            return self.handle_profile_pic_deletion()

        # Determine which form was submitted based on a hidden input name
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
        return self.form_invalid_with_context(form, social_form)

    def handle_valid_profile_forms(self, form, social_form):
        profile = form.save(commit=False)
        success_messages = []
        error_messages = []

        # Handle profile picture upload
        if 'profile_pic' in self.request.FILES:
            image_result = self._handle_profile_image_upload(
                profile, success_messages, error_messages, form, social_form
            )
            if image_result is not None:  # Error occurred
                return image_result

        profile.save()
        self._update_social_links(profile, social_form)
        success_messages.append('Profile updated successfully!')

        return self._create_success_response(success_messages, error_messages)

    def _handle_profile_image_upload(
            self,
            profile,
            success_messages,
            error_messages,
            form,
            social_form):
        """Handle profile image upload and deletion of old images"""
        # Delete old images first
        self._delete_existing_images(profile, success_messages, error_messages)

        # Upload new image
        try:
            _data = handle_image_upload(
                instance=profile,
                uploader=uploader,
                image=self.request.FILES['profile_pic'],
                folder=settings.PROFILE_FOLDER
            )
            profile.cloudinary_image_id = _data["cloudinary_image_id"]
            profile.cloudinary_image_url = _data["cloudinary_image_url"]
            profile.optimized_image_url = _data["optimized_image_url"]
            UserProfileImage.objects.update_or_create(
                profile=profile,
                defaults={
                    'cloudinary_image_id': _data["cloudinary_image_id"],
                    'cloudinary_image_url': _data["cloudinary_image_url"],
                    'optimized_image_url': _data["optimized_image_url"]
                }
            )
            success_messages.append("Success Updating Profile picture!")
            return None  # Success
        except Exception as e:
            error_messages.append(f"Image Upload Failed: {str(e)}")
            if is_ajax(self.request):
                return JsonResponse({
                    "success": False,
                    "errors": error_messages,
                    "messages": []
                }, status=400)
            messages.error(self.request, f"Image Upload Failed: {str(e)}")
            return self.form_invalid_with_context(form, social_form)

    def _delete_existing_images(
            self,
            profile,
            success_messages,
            error_messages):
        """Delete existing profile images before uploading new one"""
        try:
            if self.object.cloudinary_image_id:
                uploader.delete_image(self.object.cloudinary_image_id)
                success_messages.append(
                    "Old profile picture deleted successfully!")

            profile_image = UserProfileImage.objects.filter(
                profile=profile).first()
            if profile_image and profile_image.cloudinary_image_id:
                uploader.delete_image(profile_image.cloudinary_image_id)
                profile_image.delete()
                success_messages.append(
                    "Old profile picture deleted successfully [userprofileimage]!")
        except Exception as e:
            error_messages.append(f"Error deleting old image: {str(e)}")

    def _update_social_links(self, profile, social_form):
        """Update or create social links for the profile"""
        social_links = SocialLinks.objects.get_or_create(profile=profile)[0]
        for field, value in social_form.cleaned_data.items():
            setattr(social_links, field, value)
        social_links.save()

    def _create_success_response(self, success_messages, error_messages):
        """Create and return success response for both AJAX and regular requests"""
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": error_messages,
            "redirect_url": self.get_success_url()
        }

        if is_ajax(self.request):
            return JsonResponse(response_data)

        for message in success_messages:
            messages.success(self.request, message)
        return redirect(self.get_success_url())

    def handle_password_change(self):
        profile_user = self.object.user
        form = UserPasswordChangeForm(profile_user, self.request.POST)

        if form.is_valid():
            user = form.save()
            # Only update session auth hash if changing own password
            if self.request.user == user:
                update_session_auth_hash(self.request, user)

            success_messages = ['Password updated successfully!']

            response_data = {
                "success": True,
                "messages": success_messages,
                "errors": [],
                "redirect_url": self.get_success_url()
            }

            if is_ajax(self.request):
                return JsonResponse(response_data)

            messages.success(self.request, 'Password updated successfully!')
            return redirect(self.get_success_url())

        self.request.session['active_tab'] = 'profile-change-password'

        # Handle form errors for AJAX requests
        if is_ajax(self.request):
            error_messages = []
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # For non-AJAX requests
        _context_data = self.get_context_data(password_form=form)
        return self.render_to_response(_context_data)

    def handle_settings_update(self):
        profile_user = self.object.user
        settings, _ = UserSettings.objects.get_or_create(user=profile_user)

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

            success_messages = ['Settings updated successfully!']

            response_data = {
                "success": True,
                "messages": success_messages,
                "errors": [],
                "redirect_url": self.get_success_url()
            }

            if is_ajax(self.request):
                return JsonResponse(response_data)

            messages.success(self.request, 'Settings updated successfully!')
            return redirect(self.get_success_url())

        self.request.session['active_tab'] = 'profile-settings'

        # Handle form errors for AJAX requests
        if is_ajax(self.request):
            error_messages = []
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # For non-AJAX requests
        _context_data = self.get_context_data(settings_form=form)
        return self.render_to_response(_context_data)

    def handle_profile_pic_deletion(self):
        success_messages = []
        error_messages = []

        if self.object.cloudinary_image_id:
            try:
                uploader.delete_image(self.object.cloudinary_image_id)
                self.object.profile_pic = None
                self.object.cloudinary_image_id = None
                self.object.cloudinary_image_url = None
                self.object.optimized_image_url = None
                self.object.save()
                success_messages.append("Success Deleting Profile Picture!")

                if is_ajax(self.request):
                    return JsonResponse({
                        "success": True,
                        "messages": success_messages,
                        "errors": error_messages
                    })

            except Exception as e:
                error_messages.append(
                    f"Error deleting profile picture: {str(e)}")
                if is_ajax(self.request):
                    return JsonResponse({
                        "success": False,
                        "errors": error_messages,
                        "messages": []
                    }, status=400)

        error_messages.append("No profile picture to delete")
        return JsonResponse({
            "success": False,
            "errors": error_messages,
            "messages": []
        }, status=400)
