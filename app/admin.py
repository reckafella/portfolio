from django.contrib import admin

from app.forms import ProjectsAdmin, ContactFormAdminForm
from app.models import Projects, Message

admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Message, ContactFormAdminForm)