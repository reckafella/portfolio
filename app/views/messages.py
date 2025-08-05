import json
from django.shortcuts import get_object_or_404
from django.views.generic import FormView, TemplateView, ListView
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy as reverse
from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.contrib import messages

from app.models import Message
from app.forms.contact import ContactForm
from django.core.exceptions import PermissionDenied
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator

from app.views.helpers.helpers import is_ajax


class ContactView(FormView):
    template_name = "app/contact/contact.html"
    form_class = ContactForm
    success_url = reverse('app:contact_success')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Contact",
            "submit_text": "Send Message",
            "data_loading_text": "Sending Message",
            "form_id": "contact-form",
            "actionurl": reverse('app:contact'),
        })
        return context

    def form_valid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                form.save()
                message_data = {
                    "name": form.cleaned_data.get("name"),
                    "email": form.cleaned_data.get("email"),
                    "subject": form.cleaned_data.get("subject"),
                    "message": form.cleaned_data.get("message"),
                }
                # Store the message data as JSON string for later retrieval
                messages.success(self.request, json.dumps(message_data))
                return JsonResponse({
                    "success": True,
                    "redirect_url": str(self.success_url),
                    "message": "Message sent successfully",
                    "message_data": message_data
                })
            except Exception as e:
                return JsonResponse({
                    "success": False,
                    "errors": str(e)
                })
        else:
            # For non-AJAX requests, save the form and add a simple message
            form.save()
            messages.success(
                self.request,
                "Your message has been sent successfully!"
            )
        return super().form_valid(form)

    def form_invalid(self, form):
        """Handle form validation errors, especially for AJAX requests"""
        if is_ajax(self.request):
            # Collect all form errors
            error_messages = []

            # Field-specific errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            # Non-field errors (from clean() method)
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                "success": False,
                "errors": error_messages,
                "messages": [],
                "form_errors": form.errors.get_json_data()
            }, status=400)

        # For non-AJAX requests, use default behavior
        return super().form_invalid(form)


class ContactSuccessView(TemplateView):
    template_name = "app/contact/success.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Message Sent"
        context["message_data"] = None
        context["message_text"] = ""

        message_list = list(messages.get_messages(self.request))
        if message_list:
            try:
                # Try to parse the message as JSON
                message_content = message_list[0].message
                if message_content:
                    # Check if it's JSON by trying to parse it
                    parsed_data = json.loads(message_content)
                    context["message_data"] = parsed_data
                else:
                    context["message_text"] = (
                        "Your message has been sent successfully!"
                    )
            except (json.JSONDecodeError, TypeError, AttributeError):
                # If JSON parsing fails, treat as regular text message
                context["message_text"] = (
                    str(message_list[0].message)
                    if message_list[0].message
                    else "Your message has been sent successfully!"
                )
        else:
            # No messages found, provide default success message
            context["message_text"] = (
                "Your message has been sent successfully!"
            )

        return context


class MessagesView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Message
    template_name = "app/contact/messages.html"
    context_object_name = "messages"
    ordering = ["-created_at"]
    paginate_by = 10

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser

    """
    def handle_no_permission(self):
            raise PermissionDenied("No permission to view this page")
    """

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Messages"
        return context

    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            messages = self.get_queryset()
            html = render_to_string(
                self.template_name,
                {
                    "messages": messages,
                    "page_title": "Messages"
                }
            )
            return JsonResponse({"success": True, "html": html})
        return super().get(request, *args, **kwargs)


@method_decorator(require_POST, name='dispatch')
class MarkMessageReadView(UserPassesTestMixin, TemplateView):
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or user.is_superuser)

    def handle_no_permission(self):
        raise PermissionDenied

    @staticmethod
    def post(self, request, message_id, *args, **kwargs):
        message = get_object_or_404(Message, id=message_id)
        message.mark_as_read()
        return JsonResponse({
            "success": True,
            "message": "Message marked as read"
        })
