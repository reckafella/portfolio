from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import FormView

from ....app.views.helpers.helpers import is_ajax


class BaseAuthentication(FormView):
    template_name = "auth/auth.html"
    form_class = None

    def get_success_url(self):
        next_url = self.request.GET.get("next")\
            or self.request.POST.get("next")
        if url_has_allowed_host_and_scheme(next_url, allowed_hosts=None):
            return next_url
        return reverse("app:home")

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("app:home")
        return super().dispatch(request, *args, **kwargs)

    def form_invalid(self, form):
        """
         Handles form validation errors, esp. in AJAX requests
        """
        if is_ajax(self.request):
            error_messages = []

            # field-specific errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        error_messages.append(str(error))
                    else:
                        field_name = form.fields[field].label or\
                            field.replace('_', ' ').title()
                        error_messages.append(f"{field_name}: {error}")
            # non-field errors
            for error in form.non_field_errors():
                error_messages.append(str(error))

            return JsonResponse({
                'success': False,
                'errors': error_messages,
                'messages': []
            }, status=400)

        # for non-ajax requests
        return super().form_invalid(form)

    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return self.render_to_response({"form": self.get_form()})
        return super().get(request, *args, **kwargs)

    def handle_error(self, message):
        if is_ajax(self.request):
            return JsonResponse({"success": False, "errors": [message]})
        messages.error(self.request, message)
        return self.form_invalid(self.get_form())

    def handle_success(self, message):
        if is_ajax(self.request):
            return JsonResponse({
                "success": True,
                "messages": [message],
                "redirect_url": self.get_success_url()
            })
        messages.success(self.request, message)
        return redirect(self.get_success_url())
