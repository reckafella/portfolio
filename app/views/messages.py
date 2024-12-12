from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from app.models import Message
from app.views.helpers.helpers import is_ajax


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
