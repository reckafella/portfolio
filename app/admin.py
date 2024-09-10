from django.contrib import admin

from app.forms import BlogPostAdmin, ProjectsAdmin
from app.models import BlogPost, Projects

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Projects, ProjectsAdmin)
