import json

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse_lazy as reverse
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from django.views.generic import DetailView, FormView, ListView, TemplateView, View

from app.forms.contact import ContactForm
from app.models import Message
from app.views.helpers.helpers import is_ajax


class ContactFormConfigView(View):
    """API endpoint to return contact form configuration"""

    def get(self, request, *args, **kwargs):
        form_config = {
            "fields": {
                "name": {
                    "label": "Name",
                    "type": "TextInput",
                    "required": True,
                    "help_text": "Your full name",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 50
                },
                "email": {
                    "label": "Email",
                    "type": "EmailInput",
                    "required": True,
                    "help_text": "Enter a valid email address",
                    "disabled": False,
                    "widget": "EmailInput",
                    "max_length": 70
                },
                "subject": {
                    "label": "Subject",
                    "type": "TextInput",
                    "required": True,
                    "help_text": "What's this about?",
                    "disabled": False,
                    "widget": "TextInput",
                    "max_length": 150
                },
                "message": {
                    "label": "Message",
                    "type": "Textarea",
                    "required": True,
                    "help_text": "Tell me about your project or just say hello...",
                    "disabled": False,
                    "widget": "Textarea",
                    "max_length": 1000
                },
                "captcha": {
                    "label": "Captcha",
                    "type": "CaptchaTextInput",
                    "required": True,
                    "help_text": "Enter the characters shown in the image",
                    "disabled": False,
                    "widget": "CaptchaTextInput"
                }
            }
        }
        return JsonResponse(form_config)


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
            field_errors = {}

            # Field-specific errors - use field ID format for JavaScript
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        # Map field names to their HTML IDs
                        field_id = f"id_{field}"
                        field_errors[field_id] = str(error)

                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")

            # Non-field errors (from clean() method)
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                "success": False,
                "errors": error_messages,  # For JavaScript processing
                "messages": [],  # Keep for display
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
    template_name = "app/contact/inbox.html"
    context_object_name = "messages"
    ordering = ["-created_at"]
    paginate_by = 20

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_queryset(self):
        queryset = super().get_queryset()

        # Handle search
        search_query = self.request.GET.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(subject__icontains=search_query) |
                Q(message__icontains=search_query)
            )

        # Handle filters
        filter_type = self.request.GET.get('filter', 'all')
        if filter_type == 'unread':
            queryset = queryset.filter(is_read=False)
        elif filter_type == 'read':
            queryset = queryset.filter(is_read=True)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Message Inbox",
            "search_query": self.request.GET.get('search', ''),
            "current_filter": self.request.GET.get('filter', 'all'),
            "total_messages": Message.objects.count(),
            "unread_count": Message.objects.filter(is_read=False).count(),
            "read_count": Message.objects.filter(is_read=True).count(),
        })
        return context

    def get(self, request, *args, **kwargs):
        if is_ajax(request):
            self.object_list = self.get_queryset()
            context = self.get_context_data()

            html = render_to_string(
                "app/contact/inbox_content.html",
                context,
                request=request
            )
            return JsonResponse({
                "success": True,
                "html": html,
                "unread_count": context["unread_count"],
                "total_messages": context["total_messages"]
            })
        return super().get(request, *args, **kwargs)


@method_decorator(require_POST, name='dispatch')
class MarkMessageReadView(UserPassesTestMixin, View):
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or user.is_superuser)

    def handle_no_permission(self):
        raise PermissionDenied

    def post(self, request, message_id, *args, **kwargs):
        message = get_object_or_404(Message, id=message_id)
        message.mark_as_read()

        if is_ajax(request):
            return JsonResponse({
                "success": True,
                "message": "Message marked as read",
                "is_read": True
            })
        return JsonResponse({"success": True})


class MessageDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = Message
    template_name = "app/contact/message_detail.html"
    context_object_name = "message"
    pk_url_kwarg = "message_id"

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser

    def get_object(self, queryset=None):
        message = super().get_object(queryset)
        # Mark message as read when viewed
        if not message.is_read:
            message.mark_as_read()
        return message

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = f"Message from {self.object.name}"
        return context

    def get(self, request, *args, **kwargs):
        if is_ajax(request):
            self.object = self.get_object()
            context = self.get_context_data()

            html = render_to_string(
                "app/contact/message_detail_modal.html",
                context,
                request=request
            )
            return JsonResponse({
                "success": True,
                "html": html,
                "message_id": self.object.id,
                "is_read": True
            })
        return super().get(request, *args, **kwargs)


@method_decorator(require_POST, name='dispatch')
class DeleteMessageView(UserPassesTestMixin, View):
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or user.is_superuser)

    def handle_no_permission(self):
        raise PermissionDenied

    def post(self, request, message_id, *args, **kwargs):
        message = get_object_or_404(Message, id=message_id)
        message_name = message.name
        message.delete()

        if is_ajax(request):
            return JsonResponse({
                "success": True,
                "message": f"Message from {message_name} has been deleted",
                "deleted_id": message_id
            })
        return JsonResponse({"success": True})


@method_decorator(require_POST, name='dispatch')
class BulkMessageActionsView(UserPassesTestMixin, View):
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or user.is_superuser)

    def handle_no_permission(self):
        raise PermissionDenied

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        message_ids = request.POST.getlist('message_ids[]')

        if not action or not message_ids:
            return JsonResponse({
                "success": False,
                "message": "Invalid action or no messages selected"
            }, status=400)

        try:
            message_ids = [int(mid) for mid in message_ids]
            messages_qs = Message.objects.filter(id__in=message_ids)

            if action == 'mark_read':
                updated = messages_qs.update(is_read=True)
                return JsonResponse({
                    "success": True,
                    "message": f"Marked {updated} messages as read",
                    "action": "mark_read",
                    "affected_ids": message_ids
                })

            elif action == 'mark_unread':
                updated = messages_qs.update(is_read=False)
                return JsonResponse({
                    "success": True,
                    "message": f"Marked {updated} messages as unread",
                    "action": "mark_unread",
                    "affected_ids": message_ids
                })

            elif action == 'delete':
                count = messages_qs.count()
                messages_qs.delete()
                return JsonResponse({
                    "success": True,
                    "message": f"Deleted {count} messages",
                    "action": "delete",
                    "affected_ids": message_ids
                })

            else:
                return JsonResponse({
                    "success": False,
                    "message": "Invalid action"
                }, status=400)

        except (ValueError, TypeError) as e:
            return JsonResponse({
                "success": False,
                "message": f"Invalid message IDs: {str(e)}"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "success": False,
                "message": f"Error performing action: {str(e)}"
            }, status=500)
