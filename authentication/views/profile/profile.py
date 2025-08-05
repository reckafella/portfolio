# views.py
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy as reverse
from django.views.generic import UpdateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.conf import settings


from authentication.models import Profile, SocialLinks, UserSettings
from app.views.helpers.helpers import handle_no_permissions
from authentication.forms.profile import (
    ProfileForm, SocialLinksForm,
    UserPasswordChangeForm, UserSettingsForm
)
from app.views.helpers.cloudinary import (
    CloudinaryImageHandler, handle_image_upload
)
from app.views.helpers.helpers import is_ajax

uploader = CloudinaryImageHandler()


class ProfileView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Profile
    form_class = ProfileForm
    template_name = 'auth/profile/profile_details.html'

    def test_func(self):
        # Check if user is viewing their own profile or is an admin
        username = self.kwargs.get('username')
        return (self.request.user.is_authenticated and
                (self.request.user.username == username or
                 self.request.user.is_superuser))

    def get_object(self):
        username = self.kwargs.get('username')
        user_profile = get_object_or_404(Profile, user__username=username)
        return user_profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Get the profile user based on URL
        username = self.kwargs.get('username')
        profile_user = self.object.user

        # Add forms for all tabs
        social_links = SocialLinks.objects.get_or_create(
            profile=self.object,
            defaults={}
        )[0]
        settings = UserSettings.objects.get_or_create(
            user=profile_user,
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
                UserPasswordChangeForm(profile_user)
            )
        if 'settings_form' not in kwargs:
            context['settings_form'] = UserSettingsForm(instance=settings)

        username_display = username.capitalize()
        active_tabs = [
            'profile-edit', 'profile-change-password', 'profile-settings'
            ]
        active_tab = self.request.session.get('active_tab', 'profile-overview')
        context['page_title'] = f"{username_display}'s Profile"
        context['active_tab'] = active_tab
        context['active_tab'] = ('profile-overview' if context['active_tab']
                                 not in active_tabs else context['active_tab'])

        # Add flag to indicate if viewing user is owner or admin
        context['is_owner'] = self.request.user.username == username
        context['is_admin'] = self.request.user.is_superuser
        context['can_edit'] = context['is_owner'] or context['is_admin']

        context['search_form_id'] = "search-form"
        context['settings_form_id'] = "settings-form"
        context['profile_form_id'] = "profile-form"
        context['change_password_id'] = 'change-password-form'
        context["data_loading_text"] = "Saving changes..."

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
            try:
                # Check if the user has a profile picture already
                if self.object.cloudinary_image_id:
                    # Delete the old image before uploading a new one
                    uploader.delete_image(self.object.cloudinary_image_id)
                    _message = "Old profile picture deleted successfully!"
                    success_messages.append(_message)
            except Exception as e:
                # Handle any errors that occur during the deletion
                _message = f"Error deleting old image: {str(e)}"
                error_messages.append(_message)

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
                success_messages.append("Success Updating Profile picture!")
            except Exception as e:
                # Handle any errors that occur during the upload
                error_messages.append(f"Image Upload Failed: {str(e)}")

                # Return error response for AJAX requests
                if is_ajax(self.request):
                    return JsonResponse({
                        "success": False,
                        "errors": error_messages,
                        "messages": []
                    }, status=400)

                # For non-AJAX requests, add error msg and return form invalid
                messages.error(self.request, f"Image Upload Failed: {str(e)}")
                return self.form_invalid_with_context(form, social_form)

        profile.save()

        # Update or create social links
        social_links = SocialLinks.objects.get_or_create(profile=profile)[0]
        for field, value in social_form.cleaned_data.items():
            setattr(social_links, field, value)
        social_links.save()

        success_messages.append('Profile updated successfully!')

        # Prepare response data
        response_data = {
            "success": True,
            "messages": success_messages,
            "errors": error_messages,
            "redirect_url": self.get_success_url()
        }

        if is_ajax(self.request):
            return JsonResponse(response_data)

        # For non-AJAX requests, add success message and redirect
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

    def form_invalid_with_context(self, form, social_form=None):
        """
        Handle form validation errors with proper context for multiple forms
        """
        if is_ajax(self.request):
            error_messages = []

            # Handle profile form errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            # Handle social form errors if provided
            if social_form and not social_form.is_valid():
                for field, errors in social_form.errors.items():
                    for error in errors:
                        if field == '__all__':
                            error_messages.append(str(error))
                        else:
                            field_name = social_form.fields[field].label or\
                                field.replace('_', ' ').title()
                            error_messages.append(f"{field_name}: {error}")

            # Handle non-field errors
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # For non-AJAX requests
        context_data = self.get_context_data()
        if social_form:
            context_data['social_form'] = social_form
        return self.render_to_response(context_data)

    def get_success_url(self):
        """Redirect to the profile detail page after successful update"""
        username = self.kwargs.get('username')
        return reverse('authentication:user_profile',
                       kwargs={'username': username})

    def form_invalid(self, form):
        """
        Handles form validation errors, esp. in AJAX requests
        """
        return self.form_invalid_with_context(form)
