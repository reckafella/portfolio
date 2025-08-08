from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy as reverse
from django.views.generic import UpdateView

from app.views.helpers.helpers import is_ajax
from authentication.forms.profile import (ProfileForm, SocialLinksForm,
                                          UserPasswordChangeForm,
                                          UserSettingsForm)
from authentication.models import Profile, SocialLinks, UserSettings


class BaseProfileView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
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

        user_settings = UserSettings.objects.get_or_create(
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
            context['settings_form'] = UserSettingsForm(instance=user_settings)

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

    def form_invalid_with_context(self, form, social_form=None):
        """
        Handle form validation errors with proper context for multiple forms
        """
        if is_ajax(self.request):
            error_messages = self._collect_form_errors(form, social_form)
            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # For non-AJAX requests
        return self._handle_non_ajax_form_errors(social_form)

    def _collect_form_errors(self, form, social_form=None):
        """Collect all form errors into a single list"""
        error_messages = []

        # Handle profile form errors
        error_messages.extend(self._extract_form_field_errors(form))

        # Handle social form errors if provided
        if social_form and not social_form.is_valid():
            error_messages.extend(self._extract_form_field_errors(social_form))

        # Handle non-field errors
        for error in form.non_field_errors():
            error_messages.append(str(error))

        return error_messages

    def _extract_form_field_errors(self, form):
        """Extract field errors from a form and format them"""
        error_messages = []
        for field, errors in form.errors.items():
            for error in errors:
                if field == '__all__':
                    error_messages.append(str(error))
                else:
                    field_name = form.fields[field].label or\
                        field.replace('_', ' ').title()
                    error_messages.append(f"{field_name}: {error}")
        return error_messages

    def _handle_non_ajax_form_errors(self, social_form=None):
        """Handle form errors for non-AJAX requests"""
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
