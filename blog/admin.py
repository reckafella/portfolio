from wagtail_modeladmin.options import (
    ModelAdmin, ModelAdminGroup, modeladmin_register)
from .models import BlogPostPage


class BlogPostPageAdmin(ModelAdmin):
    model = BlogPostPage
    menu_label = "Blog Posts"
    menu_icon = "doc-full"
    list_display = ("title", "author", "first_published_at", "tags")
    search_fields = ("title", "content", "author__username")
    ordering = ("-first_published_at", "title", "author__username")


class BlogGroupAdmin(ModelAdminGroup):
    menu_label = "Blog"
    menu_icon = "folder-open-inverse"
    items = (BlogPostPageAdmin,)


modeladmin_register(BlogGroupAdmin)
