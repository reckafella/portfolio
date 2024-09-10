from django.contrib import admin

from app.forms import BlogPostAdmin
from app.models import BlogPost, Projects

admin.site.register(BlogPost, Projects, BlogPostAdmin)
