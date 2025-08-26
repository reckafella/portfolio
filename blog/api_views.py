from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt

from .models import BlogPostPage, BlogPostComment, BlogPostImage
from .forms import BlogPostForm
from .serializers import (
    BlogPostPageSerializer, BlogPostCreateSerializer,
    BlogPostCommentSerializer, BlogCommentCreateSerializer,
    BlogPostImageSerializer
)
from app.permissions import IsStaffOrReadOnly, IsAuthenticatedStaff


class BlogPostPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 20


class BlogPostListAPIView(generics.ListAPIView):
    """API view for listing blog posts with search and filtering"""
    serializer_class = BlogPostPageSerializer
    pagination_class = BlogPostPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags__name']
    ordering_fields = ['first_published_at', 'view_count', 'title']
    ordering = ['-first_published_at']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = BlogPostPage.objects.live().public().order_by('-first_published_at')

        # Filter by tag
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__name__icontains=tag)

        # Filter by year/month
        year = self.request.query_params.get('year', None)
        month = self.request.query_params.get('month', None)
        if year:
            queryset = queryset.filter(first_published_at__year=year)
        if month:
            queryset = queryset.filter(first_published_at__month=month)

        return queryset.select_related('author').prefetch_related('images', 'comments', 'tags')

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class BlogPostDetailAPIView(generics.RetrieveAPIView):
    """API view for retrieving a single blog post"""
    serializer_class = BlogPostPageSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return BlogPostPage.objects.live().public().select_related('author').prefetch_related('images', 'comments', 'tags')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment view count (with basic security)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if not any(bot in user_agent.lower() for bot in ['bot', 'crawler', 'spider']):
            instance.increment_view_count(request)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogPostCreateAPIView(generics.CreateAPIView):
    """API view for creating blog posts (staff only)"""
    serializer_class = BlogPostCreateSerializer
    permission_classes = [IsAuthenticatedStaff]

    def get(self, request):
        """ Handle GET request for creating a blog post """
        form = BlogPostForm()
        return Response({"fields": self.get_form_fields(form)}, status=status.HTTP_200_OK)

    def get_form_fields(self, form):
        """ Get the form fields for the blog post creation """
        fields = {}
        for field_name, field in form.fields.items():
            if field_name == 'editor_type':
                continue
            fields[field_name] = {
                "name": field_name,
                "label": field.label,
                "type": field.widget.__class__.__name__,
                "required": field.required,
                "help_text": field.help_text,
                "disabled": field.disabled,
                "widget": field.widget.__class__.__name__,
                "min_length": field.min_length if hasattr(field, 'min_length') else None,
                "max_length": field.max_length if hasattr(field, 'max_length') else None
            }
            if field_name == 'content':
                fields[field_name]["widget"] = "Textarea"
                fields[field_name]["type"] = "TextArea"
            if field_name == 'cover_image':
                fields[field_name]["widget"] = "FileInput"
                fields[field_name]["type"] = "FileField"
            if field_name == 'publish':
                fields[field_name]['type'] = 'BooleanField'
                fields[field_name]['widget'] = 'CheckboxInput'
        return fields

    def perform_create(self, serializer):
        serializer.save()


class BlogPostUpdateAPIView(generics.UpdateAPIView):
    """API view for updating blog posts (staff only)"""
    serializer_class = BlogPostCreateSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedStaff]

    def get_queryset(self):
        return BlogPostPage.objects.all()


class BlogPostDeleteAPIView(generics.DestroyAPIView):
    """API view for deleting blog posts (staff only)"""
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedStaff]

    def get_queryset(self):
        return BlogPostPage.objects.all()


class BlogCommentListCreateAPIView(generics.ListCreateAPIView):
    """API view for listing and creating blog comments"""
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPostPage.objects.live().public(), slug=blog_slug)
        return BlogPostComment.objects.filter(post=blog_post).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BlogPostCommentSerializer
        return BlogCommentCreateSerializer

    def perform_create(self, serializer):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPostPage.objects.live().public(), slug=blog_slug)
        serializer.save(post=blog_post)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def blog_stats_api(request):
    """API endpoint for blog statistics"""
    from django.db.models import Count
    from collections import Counter

    posts = BlogPostPage.objects.live().public()
    total_posts = posts.count()
    total_views = sum(posts.values_list('view_count', flat=True))
    total_comments = BlogPostComment.objects.count()

    # Get popular tags
    all_tags = []
    for post in posts:
        all_tags.extend([tag.name for tag in post.tags.all()])

    popular_tags = [{'name': tag, 'count': count} for tag, count in Counter(all_tags).most_common(10)]

    # Recent posts
    recent_posts = posts.order_by('-first_published_at')[:5]
    recent_posts_data = BlogPostPageSerializer(recent_posts, many=True).data

    return Response({
        'total_posts': total_posts,
        'total_views': total_views,
        'total_comments': total_comments,
        'popular_tags': popular_tags,
        'recent_posts': recent_posts_data
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def blog_form_config(request):
    """API endpoint for blog comment form configuration"""
    return Response({
        "fields": {
            "name": {
                "label": "Name",
                "type": "TextInput",
                "required": True,
                "help_text": "Your full name",
                "disabled": False,
                "widget": "TextInput",
                "max_length": 100
            },
            "email": {
                "label": "Email",
                "type": "EmailInput",
                "required": True,
                "help_text": "Your email address",
                "disabled": False,
                "widget": "EmailInput",
                "max_length": 254
            },
            "website": {
                "label": "Website",
                "type": "URLInput",
                "required": False,
                "help_text": "Your website (optional)",
                "disabled": False,
                "widget": "URLInput",
                "max_length": 200
            },
            "comment": {
                "label": "Comment",
                "type": "Textarea",
                "required": True,
                "help_text": "Share your thoughts...",
                "disabled": False,
                "widget": "Textarea",
                "max_length": 1000
            }
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedStaff])
def blog_post_form_config(request):
    """API endpoint for blog post form configuration (staff only)"""
    return Response({
        "fields": {
            "title": {
                "label": "Title",
                "type": "TextInput",
                "required": True,
                "help_text": "Blog post title",
                "disabled": False,
                "widget": "TextInput",
                "max_length": 255
            },
            "content": {
                "label": "Content",
                "type": "Textarea",
                "required": True,
                "help_text": "Main blog post content",
                "disabled": False,
                "widget": "Textarea"
            },
            "tags_input": {
                "label": "Tags",
                "type": "TextInput",
                "required": False,
                "help_text": "Comma-separated tags",
                "disabled": False,
                "widget": "TextInput",
                "max_length": 255
            },
            "published": {
                "label": "Published",
                "type": "Select",
                "required": False,
                "help_text": "Publish this post immediately",
                "disabled": False,
                "widget": "Select",
                "choices": [["false", "Save as Draft"], ["true", "Publish Now"]]
            }
        }
    })
