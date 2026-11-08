from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils.text import slugify
from titlecase import titlecase
from django.utils import timezone
import hashlib

from blog.models import BlogPostComment

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
        # Extract the post from validated_data
        post = validated_data.get('post')
        if not post:
            raise serializers.ValidationError("Post is required")

        name = titlecase(validated_data.get('name', '').strip())
        email = validated_data.get('email', '').strip().lower()
        timestamp = timezone.now().timestamp()
        unique_string = f"{name}_{email}_{timestamp}"
        hashed = hashlib.md5(unique_string.encode()).hexdigest()[:10]
        username = f"anonymous_{hashed}"

        # Create a new user for this comment
        author = User.objects.create_user(
            username=username,
            email=email,
            password=None,
            first_name=name,
            is_active=False
        )

        # Create the comment
        comment = BlogPostComment.objects.create(
            post=post,
            author=author,
            content=validated_data.get('comment', '').strip()
        )

        return comment

    def to_representation(self, instance):
        """
        Convert the comment instance to a JSON-serializable format
        """
        return {
            'id': instance.id,
            'author_name': instance.author.first_name or instance.author.username,
            'content': instance.content,
            'created_at': instance.created_at.isoformat(),
            'created_at_formatted': instance.created_at.strftime('%B %d, %Y at %I:%M %p')
        }
