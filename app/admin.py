from django.contrib import admin

from app.forms import ContactFormAdminForm, ProjectsAdmin
from app.models import Message, Projects

admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Message, ContactFormAdminForm)