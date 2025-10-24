from rest_framework import generics, status, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

from blog.models import BlogPostPage, BlogPostComment, BlogPostImage
from blog.forms import BlogPostForm
from blog.views.api.serializers.serializers import (
    BlogPostPageSerializer, BlogPostCreateSerializer, BlogPostDeleteSerializer,
    BlogPostCommentSerializer, BlogCommentCreateSerializer,
    BlogPostImageSerializer
)
from rest_framework.permissions import IsAuthenticated
from app.permissions import IsStaffOrReadOnly, IsAuthenticatedStaff

class BlogPostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BlogPostListAPIView(generics.ListAPIView):
    """API view for listing blog posts with search and filtering"""
    serializer_class = BlogPostPageSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = BlogPostPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'intro', 'tags']
    ordering_fields = ['first_published_at', 'last_published_at', 'title', 'view_count']
    ordering = ['-first_published_at']

    def get_queryset(self):
        tag = self.request.query_params.get('tag', '')
        queryset = BlogPostPage.objects.live().public().select_related('author').order_by('-first_published_at')
        
        if tag:
            queryset = queryset.filter(tags__name__in=[tag])

        return queryset

class BlogPostDetailAPIView(generics.RetrieveAPIView):
    """API view for retrieving a single blog post"""
    serializer_class = BlogPostPageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPostPage.objects.live().public().select_related('author')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment view count (with basic security)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if not any(bot in user_agent.lower() for bot in ['bot', 'crawler', 'spider']):
            instance.increment_view_count(request)

        # Get the base post data
        serializer = self.get_serializer(instance)
        response_data = serializer.data

        # Add comment form configuration
        response_data['comment_form'] = {
            "fields": {
                "name": {
                    "label": "Name",
                    "type": "text",
                    "required": True,
                    "maxLength": 100,
                    "minLength": 2,
                    "placeholder": "Your name"
                },
                "email": {
                    "label": "Email",
                    "type": "email",
                    "required": True,
                    "maxLength": 254,
                    "placeholder": "your.email@example.com"
                },
                "website": {
                    "label": "Website",
                    "type": "url",
                    "required": False,
                    "maxLength": 200,
                    "placeholder": "https://your-website.com"
                },
                "comment": {
                    "label": "Comment",
                    "type": "textarea",
                    "required": True,
                    "minLength": 10,
                    "maxLength": 1000,
                    "placeholder": "Share your thoughts..."
                }
            }
        }

        return Response(response_data)

class BlogPostCreateAPIView(generics.CreateAPIView):
    """API view for creating blog posts (staff only)"""
    serializer_class = BlogPostCreateSerializer
    permission_classes = [IsAuthenticatedStaff]
    parser_classes = [MultiPartParser, FormParser]

class BlogPostUpdateAPIView(generics.UpdateAPIView):
    """API view for updating blog posts (staff only)"""
    serializer_class = BlogPostCreateSerializer
    permission_classes = [IsAuthenticatedStaff]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPostPage.objects.live().public()

class BlogPostDeleteAPIView(generics.DestroyAPIView):
    """API view for deleting blog posts (staff or author only)"""
    serializer_class = BlogPostDeleteSerializer
    permission_classes = [IsAuthenticatedStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        return BlogPostPage.objects.live().public()

class BlogCommentListCreateAPIView(generics.ListCreateAPIView):
    """API view for listing and creating blog comments"""
    permission_classes = [permissions.AllowAny]
    pagination_class = BlogPostPagination

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPostPage.objects.live().public(), slug=blog_slug)
        return BlogPostComment.objects.filter(post=blog_post).select_related('author').order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BlogPostCommentSerializer
        return BlogCommentCreateSerializer

    def perform_create(self, serializer):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPostPage.objects.live().public(), slug=blog_slug)

        # Validate CAPTCHA
        captcha_0 = self.request.data.get('captcha_0')
        captcha_1 = self.request.data.get('captcha_1')

        if not captcha_0 or not captcha_1:
            return Response({
                'error': 'CAPTCHA is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            CaptchaStore.objects.remove_expired()
            captcha = CaptchaStore.objects.get(hashkey=captcha_0)
            if captcha_1.upper() != captcha.response:
                return Response({
                    'error': 'Invalid CAPTCHA'
                }, status=status.HTTP_400_BAD_REQUEST)
        except CaptchaStore.DoesNotExist:
            return Response({
                'error': 'CAPTCHA has expired'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create the comment
        response = serializer.save(post=blog_post)
        
        # Delete used captcha
        captcha.delete()

        return response

    def create(self, request, *args, **kwargs):
        """Override create to handle comment creation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = self.perform_create(serializer)
        return response

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def blog_stats_api(request):
    """API endpoint for blog statistics"""
    cache_key = 'blog_stats'
    stats = cache.get(cache_key)

    if not stats:
        # Calculate stats if not cached
        posts = BlogPostPage.objects.live().public()
        total_posts = posts.count()
        total_views = sum(post.view_count for post in posts)
        total_comments = BlogPostComment.objects.count()

        # Get popular tags
        tags = {}
        for post in posts:
            for tag in post.tags.all():
                tags[tag.name] = tags.get(tag.name, 0) + 1

        popular_tags = [{'name': k, 'count': v} for k, v in sorted(
            tags.items(), key=lambda x: x[1], reverse=True)][:10]

        # Get recent posts
        recent_posts = BlogPostPageSerializer(
            posts.order_by('-first_published_at')[:5],
            many=True,
            context={'request': request}
        ).data

        stats = {
            'total_posts': total_posts,
            'total_views': total_views,
            'total_comments': total_comments,
            'popular_tags': popular_tags,
            'recent_posts': recent_posts
        }

        cache.set(cache_key, stats, 60 * 15)  # Cache for 15 minutes

    return Response(stats)

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
            },
            "captcha": {
                "label": "CAPTCHA",
                "type": "CaptchaTextInput",
                "required": True,
                "help_text": "Enter the characters shown in the image",
                "disabled": False,
                "widget": "CaptchaTextInput",
                "captcha_key": CaptchaStore.generate_key(),
                "captcha_image": captcha_image_url(CaptchaStore.objects.get(hashkey=CaptchaStore.generate_key()).hashkey)
            }
        }
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def refresh_captcha(request):
    """API endpoint for refreshing CAPTCHA"""
    captcha_key = CaptchaStore.generate_key()
    captcha_obj = CaptchaStore.objects.get(hashkey=captcha_key)

    return Response({
        'captcha_key': captcha_key,
        'captcha_image': captcha_image_url(captcha_obj.hashkey)
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
                "max_length": 200
            },
            "intro": {
                "label": "Introduction",
                "type": "Textarea",
                "required": True,
                "help_text": "Brief introduction to your post",
                "disabled": False,
                "widget": "Textarea",
                "max_length": 500
            },
            "content": {
                "label": "Content",
                "type": "Textarea",
                "required": True,
                "help_text": "Full blog post content",
                "disabled": False,
                "widget": "TinyMCE",
            },
            "featured_image": {
                "label": "Featured Image",
                "type": "ImageInput",
                "required": False,
                "help_text": "Cover image for the blog post",
                "disabled": False,
                "widget": "ImageInput",
                "accept": "image/*",
                "max_size": 15 * 1024 * 1024  # 15MB
            },
            "published": {
                "label": "Published",
                "type": "checkbox",
                "required": False,
                "help_text": "Make this post public",
                "disabled": False,
                "widget": "CheckboxInput"
            },
            "tags": {
                "label": "Tags",
                "type": "TextInput",
                "required": False,
                "help_text": "Add tags (comma separated)",
                "disabled": False,
                "widget": "TagInput"
            }
        }
    })
