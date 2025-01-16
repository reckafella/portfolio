from django.contrib import admin

from app.forms.contact import ContactFormAdminForm
from app.forms.projects import ProjectsAdmin
from app.models import Message, Projects

admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Message, ContactFormAdminForm)
