from rest_framework import serializers
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from django.contrib.auth.models import User
from django.utils.text import slugify
from titlecase import titlecase
from django.db import transaction
from django.utils import timezone
import hashlib

from app.views.helpers.cloudinary import CloudinaryImageHandler
from blog.models import BlogPostPage, BlogPostComment, BlogPostImage, BlogIndexPage

uploader = CloudinaryImageHandler()


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
    author = serializers.SerializerMethodField()
    first_published_at = serializers.DateTimeField()
    content = serializers.CharField()
    intro = serializers.SerializerMethodField()

    class Meta:
        model = BlogPostPage
        fields = [
            'id', 'title', 'slug', 'intro', 'content', 'featured_image_url',
            'tags_list', 'excerpt', 'reading_time', 'view_count', 'images',
            'comments', 'comments_count', 'first_published_at', 'last_published_at',
            'author', 'published'
        ]
        read_only_fields = ['id', 'slug', 'view_count', 'first_published_at', 'last_published_at']

    def get_author(self, obj):
        """Get the full name if available, otherwise username"""
        if obj.author:
            full_name = f"{obj.author.first_name} {obj.author.last_name}".strip()
            if full_name:
                return full_name
            return obj.author.username
        return "Anonymous"

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_reading_time(self, obj):
        # Calculate reading time (approximately 200 words per minute)
        content = obj.content or ''
        # if hasattr(obj, 'stream_content') and obj.stream_content:
        #    content += str(obj.stream_content)

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
    tags = serializers.CharField(write_only=True, required=False, help_text="Comma-separated tags", allow_blank=True)
    cover_image = serializers.FileField(
        write_only=True,
        required=False,
        help_text="Cover image for the blog post"
    )

    class Meta:
        model = BlogPostPage
        fields = ['title', 'content', 'published', 'tags', 'cover_image']

    def validate_published(self, value):
        """Handle string to boolean conversion for published field"""
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)

    def create(self, validated_data):
        tags = validated_data.pop('tags', '')
        cover_image = validated_data.pop('cover_image', None)
        blog_index = self._get_or_create_blog_index()

        with transaction.atomic():
            post = self._create_blog_post(validated_data, blog_index)
            self._handle_post_assets(post, cover_image, tags)
            self._create_revision_and_publish(post, validated_data.get('published', False))

        return post

    def _get_or_create_blog_index(self):
        """Get or create the blog index page"""
        blog_index = BlogIndexPage.objects.first()
        if not blog_index:
            # Try to find existing blog home page
            existing_page = BlogIndexPage.objects.filter(slug='blog-home').first()
            if existing_page:
                return existing_page

            # Create a new blog index page
            with transaction.atomic():
                blog_index = BlogIndexPage(
                    title="Blog Home",
                    slug="blog-home",
                )
                blog_index = BlogIndexPage.add_root(instance=blog_index)
                blog_index.save()

        if not blog_index:
            raise serializers.ValidationError("Unable to create or find blog index page")
        return blog_index

    def _create_blog_post(self, validated_data, blog_index):
        """Create the blog post instance"""
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
        try:
            blog_index.add_child(instance=post)
            post.save()
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create blog post: {str(e)}")
        return post

    def _handle_cover_image(self, post, cover_image):
        """Handle cover image upload"""
        if cover_image:
            try:
                uploader = CloudinaryImageHandler()
                response = uploader.upload_image(
                    cover_image,
                    folder=f"portfolio/blog/{post.slug}"
                )
                post.cloudinary_image_id = response.get('cloudinary_image_id')
                post.cloudinary_image_url = response.get('cloudinary_image_url')
                post.optimized_image_url = response.get('optimized_image_url')
                post.save()
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload cover image: {str(e)}")

    def _handle_tags(self, post, tags):
        """Handle tags assignment"""
        if tags:
            tag_names = [tag.strip() for tag in tags.split(',') if tag.strip()]
            post.tags.set(tag_names)

    def _handle_post_assets(self, post, cover_image, tags):
        """Handle cover image and tags for the post"""
        self._handle_cover_image(post, cover_image)
        self._handle_tags(post, tags)

    def _create_revision_and_publish(self, post, should_publish):
        """Create revision and publish if requested"""
        revision = post.save_revision(
            user=self.context['request'].user,
            approved_go_live_at=None
        )
        if should_publish:
            revision.publish()

    def _update_title_and_slug(self, instance, title):
        """Update title and generate unique slug if needed"""
        from django.utils.text import slugify
        from titlecase import titlecase
        from blog.models import BlogPostPage

        instance.title = titlecase(title)
        new_slug = slugify(title)

        if instance.slug != new_slug:
            # Check if slug already exists for another post
            counter = 1
            base_slug = new_slug
            while BlogPostPage.objects.filter(slug=new_slug).exclude(id=instance.id).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            instance.slug = new_slug

    def _update_cover_image(self, instance, cover_image):
        """Handle cover image upload"""
        from app.views.helpers.cloudinary import CloudinaryImageHandler

        uploader = CloudinaryImageHandler()
        try:
            response = uploader.upload_image(
                cover_image,
                folder=f"portfolio/blog/{instance.slug}"
            )
            instance.cloudinary_image_id = response.get('cloudinary_image_id')
            instance.cloudinary_image_url = response.get('cloudinary_image_url')
            instance.optimized_image_url = response.get('optimized_image_url')
        except Exception as e:
            raise serializers.ValidationError(f"Failed to upload cover image: {str(e)}")

    def _update_tags(self, instance, tags):
        """Handle tags update"""
        if tags is None:
            return

        if tags:
            tag_names = [tag.strip() for tag in tags.split(',') if tag.strip()]
            instance.tags.set(tag_names)
        else:
            instance.tags.clear()

    def _save_and_publish(self, instance, should_publish, user):
        """Save instance, create revision and publish if needed"""
        from django.db import transaction

        with transaction.atomic():
            instance.save()

            # Create a revision
            revision = instance.save_revision(
                user=user,
                approved_go_live_at=None
            )

            # Publish if requested
            if should_publish:
                revision.publish()

    def update(self, instance, validated_data):
        """Update an existing blog post"""
        # Extract data from validated_data
        tags = validated_data.pop('tags', None)
        cover_image = validated_data.pop('cover_image', None)

        # Update title and slug if needed
        if 'title' in validated_data:
            self._update_title_and_slug(instance, validated_data['title'])

        # Update basic fields
        if 'content' in validated_data:
            instance.content = validated_data['content']
        if 'published' in validated_data:
            instance.published = validated_data['published']

        # Handle cover image
        if cover_image:
            self._update_cover_image(instance, cover_image)

        # Handle tags
        self._update_tags(instance, tags)

        # Save and publish
        should_publish = validated_data.get('published', False)
        self._save_and_publish(instance, should_publish, self.context['request'].user)

        return instance


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

        name = validated_data.get('name', '').strip()
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


class BlogPostDeleteSerializer(serializers.ModelSerializer):
    """Serializer for deleting blog posts with proper cleanup"""

    class Meta:
        model = BlogPostPage
        fields = []  # No fields needed for deletion

    def validate(self, attrs):
        # Check if user has permission to delete
        request = self.context.get('request')
        if not request or not (request.user.is_staff or self.instance.author == request.user):
            raise serializers.ValidationError("You do not have permission to delete this post.")
        return attrs

    def delete_images(self, post):
        """Delete all post images from Cloudinary and database"""
        from app.views.helpers.cloudinary import CloudinaryImageHandler
        uploader = CloudinaryImageHandler()

        success_messages = []
        error_messages = []

        # Delete cover image if exists
        if post.cloudinary_image_id:
            try:
                uploader.delete_image(post.cloudinary_image_id)
                success_messages.append("Successfully deleted cover image.")
            except Exception as e:
                error_messages.append(f"Failed to delete cover image: {str(e)}")

        # Delete all blog post images
        images = list(post.images.all())
        for image in images:
            try:
                if image.cloudinary_image_id:
                    uploader.delete_image(image.cloudinary_image_id)
                image.delete()
                success_messages.append("Successfully deleted post image.")
            except Exception as e:
                error_messages.append(f"Failed to delete post image: {str(e)}")

        if error_messages:
            raise serializers.ValidationError(error_messages)

        return success_messages

    def delete_comments(self, post):
        """Delete all comments and their associated anonymous users"""
        success_messages = []
        error_messages = []

        comments = list(post.comments.all())
        for comment in comments:
            try:
                # Delete the anonymous user if they have no other comments
                author = comment.author
                comment.delete()
                if author and author.is_active is False:  # Anonymous user
                    if not author.blog_post_comments.exists():
                        author.delete()
                success_messages.append("Successfully deleted comment.")
            except Exception as e:
                error_messages.append(f"Failed to delete comment: {str(e)}")

        if error_messages:
            raise serializers.ValidationError(error_messages)

        return success_messages

    def delete_post(self, post):
        """Delete the blog post after cleaning up related objects"""
        try:
            post_title = post.title

            # Delete all revisions
            post.revisions.all().delete()

            # Delete the page
            post.delete()

            return [f"Blog post '{post_title}' deleted successfully!"]
        except Exception as e:
            raise serializers.ValidationError(f"Blog post deletion failed: {str(e)}")

    def delete(self, instance):
        """Handle the complete deletion process with rollback on failure"""
        from django.db import transaction

        success_messages = []

        try:
            with transaction.atomic():
                # Delete in order: images, comments, then the post
                success_messages.extend(self.delete_images(instance))
                success_messages.extend(self.delete_comments(instance))
                success_messages.extend(self.delete_post(instance))

                return {
                    "success": True,
                    "messages": success_messages,
                    "errors": []
                }

        except serializers.ValidationError as e:
            # Re-raise validation errors
            raise serializers.ValidationError(str(e))
        except Exception as e:
            raise Exception(str(e))
