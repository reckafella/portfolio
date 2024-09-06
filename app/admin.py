from django.contrib import admin

from app.forms import BlogPostAdmin
from app.models import BlogPost

admin.site.register(BlogPost, BlogPostAdmin)
