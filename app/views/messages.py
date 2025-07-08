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
            "data_loding_text": "Sending Message...",
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
                messages.success(self.request, json.dumps(message_data))
                return JsonResponse({
                    "success": True,
                    "redirect_url": self.success_url,
                    "message": "Message sent successfully",
                    "message_data": message_data
                })
            except Exception as e:
                return JsonResponse({
                    "success": False,
                    "errors": str(e)
                })
        return super().form_valid(form)

    def form_invalid(self, form):
        if is_ajax(self.request):
            return JsonResponse({
                "success": False,
                "errors": form.errors
            })
        return super().form_invalid(form)


class ContactSuccessView(TemplateView):
    template_name = "app/contact/success.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["page_title"] = "Message Sent"
        message_list = list(messages.get_messages(self.request))
        if message_list:
            context["message_data"] = json.loads(message_list[0].message)
        return context


class MessagesView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Message
    template_name = "app/contact/messages.html"
    context_object_name = "messages"
    ordering = ["-created_at"]

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
        return self.request.user.is_staff

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
