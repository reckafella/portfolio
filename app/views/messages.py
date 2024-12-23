from multiprocessing import context
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.urls import reverse_lazy

from app.models import Message
from app.views.helpers.helpers import is_ajax
from app.forms import ContactForm


def contact_view(request):
    """View to render the contact page"""
    form = ContactForm()
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data.get("name")
            email = form.cleaned_data.get("email")
            subject = form.cleaned_data.get("subject")
            message = form.cleaned_data.get("message")

            if name and subject and email and message:
                form.save()
                message_data = {
                    "name": name,
                    "email": email,
                    "subject": subject,
                    "message": message,
                }
                response = {
                    "success": True,
                    'redirect_url': reverse_lazy('app:contact_success'),
                    "message": "Message sent successfully",
                    "message_data": message_data
                }

            else:
                response = {
                    "success": False,
                    "errors": "All fields are required"
                }

            if is_ajax(request):
                return JsonResponse(response, status=200)
    else:
        form = ContactForm()

    context = {"form": form, "page_title": "Contact", "submit_text": "Send Message"}
    return render(
        request=request,
        template_name="app/contact/contact.html",
        context=context, status=200
    )


def contact_success_view(request):
    """View to render the contact success page"""
    context = {
        "page_title": "Message Sent"
    }

    return render(
        request=request,
        template_name="app/contact/success.html",
        context=context,
        status=200
    )


def view_messages(request):
    """View to render the messages page"""
    if not request.user.is_staff:
        return render(request, "app/errors/403.html", status=404)

    messages = Message.objects.all().order_by("-created_at")
    if is_ajax(request):
        messages_html = render_to_string(
            "app/messages.html", {"messages": messages, "page_title": "Messages"}
        )
        return JsonResponse({"success": True, "html": messages_html})

    context = {"messages": messages, "page_title": "Messages"}
    return render(request, "app/messages.html", context)
