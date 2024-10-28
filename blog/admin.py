from django.contrib import admin
from blog.models import BlogPost
from blog.forms import BlogPostAdmin

admin.site.register(BlogPost, BlogPostAdmin)
