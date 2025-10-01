from rest_framework import serializers
from wagtail.images.models import Image
from .models import BlogPostPage, BlogPostComment, BlogPostImage
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url


class BlogPostPageSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    featured_image_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = BlogPostPage
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'date',
            'featured_image_url', 'cover_image_url', 'tags_list',
            'reading_time', 'view_count', 'comments_count',
            'first_published_at', 'last_published_at', 'author', 'intro'
        ]

    def get_content(self, obj):
        """Get the rendered content of the blog post"""
        if hasattr(obj, 'body'):
            return obj.body
        return obj.content

    def get_excerpt(self, obj):
        """Get a short excerpt of the blog post"""
        if hasattr(obj, 'excerpt'):
            return obj.excerpt
        # Default to first 150 characters of content if no excerpt
        return obj.content[:150] + '...' if len(obj.content) > 150 else obj.content

    def get_featured_image_url(self, obj):
        """Get the URL of the featured image"""
        if obj.featured_image:
            return obj.featured_image.url
        return None

    def get_cover_image_url(self, obj):
        """Get the URL of the cover image"""
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def get_tags_list(self, obj):
        """Get list of tag names"""
        return [tag.name for tag in obj.tags.all()]

    def get_reading_time(self, obj):
        """Calculate estimated reading time"""
        return obj.reading_time

    def get_comments_count(self, obj):
        """Get number of comments"""
        return obj.comments.count()

    def get_author(self, obj):
        """Get author name"""
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return "Anonymous"


class BlogPostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostComment
        fields = ['id', 'author_name', 'content', 'created_at']


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog comments"""
    name = serializers.CharField(max_length=100, help_text="Your name")
    email = serializers.EmailField(help_text="Your email address")
    website = serializers.URLField(required=False, allow_blank=True, help_text="Your website (optional)")
    comment = serializers.CharField(help_text="Your comment")
    captcha_0 = serializers.CharField(required=True, write_only=True)
    captcha_1 = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = BlogPostComment
        fields = ['name', 'email', 'website', 'comment', 'captcha_0', 'captcha_1']

    def validate_comment(self, value):
        """
        Validate comment content length and format.
        """
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Comment must be at least 10 characters long."
            )
        return value

    def validate(self, attrs):
        """
        Validate CAPTCHA.
        """
        captcha_0 = attrs.get('captcha_0')
        captcha_1 = attrs.get('captcha_1')

        if not captcha_0 or not captcha_1:
            raise serializers.ValidationError(
                {'captcha': 'CAPTCHA is required'}
            )

        # Clean expired captchas
        CaptchaStore.objects.remove_expired()

        try:
            captcha = CaptchaStore.objects.get(hashkey=captcha_0)
            if captcha_1.upper() != captcha.response:
                raise serializers.ValidationError(
                    {'captcha': 'Invalid CAPTCHA. Please try again.'}
                )
        except CaptchaStore.DoesNotExist:
            raise serializers.ValidationError(
                {'captcha': 'CAPTCHA has expired. Please refresh and try again.'}
            )

        return attrs

    def create(self, validated_data):
        """
        Create the comment.
        """
        # Remove CAPTCHA data before creating comment
        validated_data.pop('captcha_0', None)
        validated_data.pop('captcha_1', None)

        # Map fields to model fields
        comment_data = {
            'author_name': validated_data['name'],
            'author_email': validated_data['email'],
            'website': validated_data.get('website', ''),
            'content': validated_data['comment'],
            'post': validated_data['post']
        }

        return BlogPostComment.objects.create(**comment_data)

    def to_representation(self, instance):
        """
        Convert the comment instance to a JSON-serializable format
        """
        ret = super().to_representation(instance)
        ret['created_at'] = instance.created_at.isoformat()
        ret['id'] = instance.id
        ret['author_name'] = instance.author_name
        return ret


class BlogPostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostImage
        fields = ['id', 'image', 'alt_text', 'caption']


class BlogPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostPage
        fields = [
            'title', 'intro', 'content', 'featured_image',
            'cover_image', 'published', 'tags'
        ]


class BlogPostDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostPage
        fields = ['slug']
