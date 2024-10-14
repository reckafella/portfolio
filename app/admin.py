from django.contrib import admin

from app.forms import BlogPostAdmin, ProjectsAdmin, ContactFormAdminForm
from app.models import BlogPost, Projects, Message

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Message, ContactFormAdminForm)