from rest_framework import serializers
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from .models import BlogPostPage, BlogPostComment, BlogPostImage
from django.contrib.auth.models import User


class BlogPostImageSerializer(serializers.ModelSerializer):
    """Serializer for blog post images"""
    image_url = serializers.SerializerMethodField()
    optimized_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPostImage
        fields = ['id', 'cloudinary_image_id', 'cloudinary_image_url', 'optimized_image_url', 'image_url', 'optimized_url']
    
    def get_image_url(self, obj):
        return obj.cloudinary_image_url or None
    
    def get_optimized_url(self, obj):
        return obj.optimized_image_url or obj.cloudinary_image_url


class BlogPostCommentSerializer(serializers.ModelSerializer):
    """Serializer for blog post comments"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPostComment
        fields = [
            'id', 'content', 'created_at', 'created_at_formatted',
            'author_name', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'author_name']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y at %I:%M %p')


class BlogPostPageSerializer(serializers.ModelSerializer):
    """Serializer for blog posts"""
    images = BlogPostImageSerializer(many=True, read_only=True)
    comments = BlogPostCommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    featured_image_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    author_name = serializers.CharField(source='author.username', read_only=True)
    date = serializers.DateTimeField(source='first_published_at', read_only=True)
    body = serializers.CharField(source='content', read_only=True)
    intro = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPostPage
        fields = [
            'id', 'title', 'slug', 'intro', 'body', 'date', 'featured_image_url',
            'tags_list', 'excerpt', 'reading_time', 'view_count', 'images',
            'comments', 'comments_count', 'first_published_at', 'last_published_at',
            'author_name', 'published'
        ]
        read_only_fields = ['id', 'slug', 'view_count', 'first_published_at', 'last_published_at']
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_reading_time(self, obj):
        # Calculate reading time (approximately 200 words per minute)
        content = obj.content or ''
        if hasattr(obj, 'stream_content') and obj.stream_content:
            content += str(obj.stream_content)
        
        word_count = len(content.split()) if content else 0
        reading_time = max(1, round(word_count / 200))
        return f"{reading_time} min read"
    
    def get_excerpt(self, obj):
        content = obj.content or ''
        if len(content) > 200:
            return f"{content[:200]}..."
        return content
    
    def get_intro(self, obj):
        # Return first paragraph as intro
        content = obj.content or ''
        if content:
            paragraphs = content.split('\n')
            return paragraphs[0] if paragraphs else ''
        return ''
    
    def get_featured_image_url(self, obj):
        if obj.cover_image_url:
            return obj.cover_image_url
        return None
    
    def get_tags_list(self, obj):
        return [tag.name for tag in obj.tags.all()]


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts"""
    tags_input = serializers.CharField(write_only=True, required=False, help_text="Comma-separated tags")
    
    class Meta:
        model = BlogPostPage
        fields = ['title', 'content', 'published', 'tags_input']
    
    def create(self, validated_data):
        from blog.models import BlogIndexPage
        from django.utils.text import slugify
        from titlecase import titlecase
        from django.db import transaction
        
        tags_input = validated_data.pop('tags_input', '')
        
        # Get the blog index page (parent)
        blog_index = BlogIndexPage.objects.first()
        if not blog_index:
            raise serializers.ValidationError("Blog index page not found")
        
        # Create the blog post page
        with transaction.atomic():
            post = BlogPostPage(
                title=titlecase(validated_data['title']),
                slug=slugify(validated_data['title']),
                content=validated_data.get('content', ''),
                published=validated_data.get('published', False),
                author=self.context['request'].user,
                seo_title=titlecase(validated_data['title']),
                seo_description=validated_data.get('content', '')[:160],
            )
            
            # Add to parent page
            blog_index.add_child(instance=post)
            post.save()
            
            # Handle tags
            if tags_input:
                tag_names = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
                post.tags.set(*tag_names)
            
            # Publish if requested
            if validated_data.get('published', False):
                revision = post.save_revision()
                revision.publish()
        
        return post


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog comments"""
    name = serializers.CharField(max_length=100, help_text="Your name")
    email = serializers.EmailField(help_text="Your email address")
    website = serializers.URLField(required=False, allow_blank=True, help_text="Your website (optional)")
    comment = serializers.CharField(help_text="Your comment")
    
    class Meta:
        model = BlogPostComment
        fields = ['name', 'email', 'website', 'comment']
    
    def validate_comment(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Comment must be at least 10 characters long")
        return value.strip()
    
    def create(self, validated_data):
        # Create a temporary user or use anonymous user approach
        from django.contrib.auth.models import User
        
        # For now, we'll use the request user or create anonymous comments
        # In a real application, you might want to handle this differently
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            author = request.user
        else:
            # Create or get anonymous user for comments
            author, created = User.objects.get_or_create(
                username='anonymous_commenter',
                defaults={
                    'email': validated_data['email'],
                    'first_name': validated_data['name'],
                    'is_active': False
                }
            )
        
        comment = BlogPostComment.objects.create(
            post=validated_data['post'],
            author=author,
            content=validated_data['comment']
        )
        
        return comment
