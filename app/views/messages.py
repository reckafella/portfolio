from django.views.generic import FormView, TemplateView, ListView
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.contrib.auth.mixins import UserPassesTestMixin
from app.models import Message
from app.forms.contact import ContactForm
from captcha.helpers import captcha_image_url
from django.core.exceptions import PermissionDenied

class ContactView(FormView):
    template_name = "app/contact/contact.html"
    form_class = ContactForm
    success_url = reverse_lazy('app:contact_success')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "page_title": "Contact",
            "submit_text": "Send Message"
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
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
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
        return context

class MessagesView(UserPassesTestMixin, ListView):
    model = Message
    template_name = "app/messages.html"
    context_object_name = "messages"
    ordering = ["-created_at"]

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        raise PermissionDenied

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

