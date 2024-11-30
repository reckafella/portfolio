from django.contrib import admin

from blog.forms import BlogPostAdmin
from blog.models import BlogPost

admin.site.register(BlogPost, BlogPostAdmin)
