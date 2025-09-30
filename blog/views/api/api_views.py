from rest_framework import generics, status, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from blog.models import BlogPostPage, BlogPostComment  # , BlogPostImage
from .serializers.serializers import (
    BlogPostPageSerializer, BlogPostCreateSerializer, BlogPostDeleteSerializer,
    BlogPostCommentSerializer, BlogCommentCreateSerializer
)
from rest_framework.permissions import IsAuthenticated
from app.permissions import IsAuthenticatedStaff, IsStaffOrReadOnly


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
        queryset = BlogPostPage.objects.live().public().order_by(
            '-first_published_at')

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
        return BlogPostPage.objects.live().public().select_related('author')\
            .prefetch_related('images', 'comments', 'tags')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment view count (with basic security)
        try:
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            if not any(bot in user_agent.lower() for bot in ['bot', 'crawler', 'spider']):
                instance.increment_view_count(request)
        except Exception as e:
            # Log error but don't fail the request
            print(f'Error incrementing view count: {str(e)}')

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
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        """ Handle GET request for creating a blog post """
        return Response({
            "fields": {
                "title": {
                    "label": "Title",
                    "type": "text",
                    "required": True,
                    "help_text": "Post title",
                    "max_length": 255
                },
                "content": {
                    "label": "Content",
                    "type": "textarea",
                    "required": True,
                    "help_text": "Post content in markdown format"
                },
                "cover_image": {
                    "label": "Cover Image",
                    "type": "file",
                    "required": False,
                    "help_text": "Cover image for the blog post",
                    "accept": "image/*"
                },
                "tags": {
                    "label": "Tags",
                    "type": "text",
                    "required": False,
                    "help_text": "Comma-separated tags (e.g., python, django, react)"
                },
                "published": {
                    "label": "Publish Now",
                    "type": "checkbox",
                    "required": False,
                    "help_text": "Make the post public immediately"
                }
            }
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Ensure we're getting a content type that includes files
        content_type = request.content_type or ''
        if not content_type.startswith('multipart/form-data'):
            return Response({
                'error': 'Content-Type must be multipart/form-data'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Convert string 'true'/'false' to boolean for published field
        data = request.data.copy()
        if 'published' in data:
            data['published'] = data['published'].lower() in ('true', '1', 'yes')

        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = serializer.save()
            return Response({
                'message': 'Blog post created successfully',
                'post': BlogPostPageSerializer(post).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the full error for debugging
            import traceback
            print('Blog post creation error:', str(e))
            print(traceback.format_exc())
            return Response({
                'error': 'Failed to create blog post',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save()


class BlogPostUpdateAPIView(generics.UpdateAPIView):
    """API view for updating blog posts (staff only)"""
    serializer_class = BlogPostCreateSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedStaff, IsStaffOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return BlogPostPage.objects.all()

    def update(self, request, *args, **kwargs) -> Response:
        """Handle blog post update with proper response"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = serializer.save()
            return Response({
                'message': 'Blog post updated successfully',
                'post': BlogPostPageSerializer(post).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class BlogPostDeleteAPIView(generics.DestroyAPIView):
    """API view for deleting blog posts (staff or author only)"""
    lookup_field = 'slug'
    serializer_class = BlogPostDeleteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BlogPostPage.objects.all()
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(author=user)
        return queryset

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        return serializer.delete(instance)


class BlogCommentListCreateAPIView(generics.ListCreateAPIView):
    """API view for listing and creating blog comments"""
    permission_classes = [permissions.AllowAny]
    pagination_class = BlogPostPagination

    def get_queryset(self):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(
            BlogPostPage.objects.live().public(), slug=blog_slug)

        return BlogPostComment.objects.filter(
            post=blog_post).select_related('author').order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BlogPostCommentSerializer
        return BlogCommentCreateSerializer

    def perform_create(self, serializer):
        blog_slug = self.kwargs.get('blog_slug')
        blog_post = get_object_or_404(BlogPostPage.objects.live().public(), slug=blog_slug)

        # Create the comment
        return serializer.save(post=blog_post)

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
            "tags": {
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
