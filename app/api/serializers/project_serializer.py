from rest_framework import serializers
from django.utils.text import slugify
import re
from django.db import transaction
from app.views.helpers.cloudinary import CloudinaryImageHandler

from app.models import Projects, Image, Video
from app.views.helpers.helpers import guess_file_type

# Note: CloudinaryImageHandler should be instantiated when needed, not at module level


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for project images"""
    class Meta:
        model = Image
        fields = ('id', 'cloudinary_image_id', 'cloudinary_image_url', 'optimized_image_url', 'live')
        read_only_fields = ('id',)


class VideoSerializer(serializers.ModelSerializer):
    """Serializer for project videos"""
    class Meta:
        model = Video
        fields = ('id', 'youtube_url', 'thumbnail_url', 'live')
        read_only_fields = ('id', 'thumbnail_url')


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for reading projects"""
    images = ImageSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    first_image = serializers.SerializerMethodField()

    class Meta:
        model = Projects
        fields = (
            'id', 'title', 'description', 'project_type', 'category',
            'client', 'project_url', 'created_at', 'updated_at',
            'slug', 'live', 'images', 'videos', 'first_image'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'slug')

    def get_first_image(self, obj):
        first_image = obj.first_image
        if first_image:
            return ImageSerializer(first_image).data
        return None


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""
    images = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        help_text="List of project images (max 5, each max 5MB)"
    )
    youtube_urls = serializers.CharField(
        write_only=True,
        required=False,
        help_text="YouTube video URLs (one per line)"
    )

    class Meta:
        model = Projects
        fields = (
            'title', 'description', 'project_type', 'category',
            'client', 'project_url', 'live', 'images', 'youtube_urls'
        )
        extra_kwargs = {
            'title': {'required': True, 'min_length': 5, 'max_length': 200},
            'project_url': {'required': True, 'max_length': 250},
            'description': {'required': True, 'min_length': 25,
                            'max_length': 1500}
        }

    def validate_youtube_urls(self, value):
        """Validate YouTube URLs"""
        if not value:
            return []

        urls = value.strip().split('\n')
        cleaned_urls = []
        youtube_pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)'

        for url in urls:
            url = url.strip()
            if url:
                if not ('youtube.com' in url or 'youtu.be' in url):
                    raise serializers.ValidationError(f"Invalid YouTube URL: {url}")
                if not re.match(youtube_pattern, url):
                    raise serializers.ValidationError(f"Invalid YouTube URL format: {url}")
                cleaned_urls.append(url)

        return cleaned_urls

    def validate_images(self, images):
        """Validate uploaded images"""
        if not images:
            return images

        config = {
            'max_size': 5 * 1024 * 1024,  # 5MB per file
            'max_files': 5,
            'max_total_size': 25 * 1024 * 1024,  # 25MB total
            'allowed_types': [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'image/webp', 'image/bmp', 'image/svg+xml'
            ]
        }

        # Validate number of files
        if len(images) > config['max_files']:
            raise serializers.ValidationError(
                f"Maximum {config['max_files']} images allowed, but {len(images)} were provided."
            )

        valid_images, errors = [], []
        total_size = 0

        self.validate_each_image(images, config, errors,
                                 total_size, valid_images)

        # Check total size
        if total_size > config['max_total_size']:
            max_total_mb = config['max_total_size'] / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            errors.append(f"Total size too large ({total_mb:.1f}MB). Maximum {max_total_mb}MB allowed")

        if errors:
            raise serializers.ValidationError(errors)

        return valid_images

    def validate_each_image(self, images, config, errors, total_size, valid_images):
        """Validate a single image file and return error message if invalid"""
        for i, image in enumerate(images, 1):
            try:
                # Check file type
                file_type = guess_file_type(image)
                if not file_type.startswith('image/'):
                    errors.append(f"File {i}: Not a valid image file (detected type: {file_type})")
                    continue

                if file_type not in config['allowed_types']:
                    errors.append(f"File {i}: Unsupported image format. Allowed formats: JPG, PNG, GIF, WebP, BMP, SVG")
                    continue

                # Check file size
                if image.size > config['max_size']:
                    max_size_mb = config['max_size'] / (1024 * 1024)
                    file_size_mb = image.size / (1024 * 1024)
                    errors.append(f"File {i}: Too large ({file_size_mb:.1f}MB). Maximum {max_size_mb}MB allowed")
                    continue

                if image.size == 0:
                    errors.append(f"File {i}: Empty file")
                    continue

                total_size += image.size
                valid_images.append(image)

            except Exception as e:
                errors.append(f"File {i}: Error processing file - {str(e)}")

    def validate(self, attrs):
        """Cross-field validation"""
        images = attrs.get('images', [])
        youtube_urls = attrs.get('youtube_urls', [])

        # Check if at least one media type is provided
        if not images and not youtube_urls:
            raise serializers.ValidationError(
                "Provide at least one image or YouTube URL"
            )

        return attrs

    def create(self, validated_data):
        """Create a new project with images and videos"""
        images = validated_data.pop('images', [])
        youtube_urls = validated_data.pop('youtube_urls', [])

        # Auto-generate slug from title
        validated_data['slug'] = slugify(validated_data['title'])

        # Create the project
        project = Projects.objects.create(**validated_data)

        # Handle image uploads
        if images:
            uploader = CloudinaryImageHandler()
            for image_file in images:
                try:
                    response = uploader.upload_image(
                        image_file,
                        folder=f"portfolio/projects/{project.slug}"
                    )
                    Image.objects.create(
                        project=project,
                        cloudinary_image_id=response.get('cloudinary_image_id'),
                        cloudinary_image_url=response.get('cloudinary_image_url'),
                        optimized_image_url=response.get('optimized_image_url')
                    )
                except Exception as e:
                    print(f"Error uploading image {image_file.name}: {str(e)}")

        # Handle YouTube videos
        if youtube_urls:
            for url in youtube_urls:
                Video.objects.create(
                    project=project,
                    youtube_url=url
                )

        return project

    def update(self, instance, validated_data):
        """Update a project"""
        from app.views.helpers.cloudinary import CloudinaryImageHandler

        images = validated_data.pop('images', [])
        youtube_urls = validated_data.pop('youtube_urls', [])

        # Update slug if title changes
        if 'title' in validated_data and validated_data['title'] != instance.title:
            validated_data['slug'] = slugify(validated_data['title'])

        # Update basic project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle new images
        if images:
            uploader = CloudinaryImageHandler()
            for image_file in images:
                try:
                    response = uploader.upload_image(
                        image_file,
                        folder=f"portfolio/projects/{instance.slug}"
                    )
                    Image.objects.create(
                        project=instance,
                        cloudinary_image_id=response.get('cloudinary_image_id'),
                        cloudinary_image_url=response.get('cloudinary_image_url'),
                        optimized_image_url=response.get('optimized_image_url')
                    )
                except Exception as e:
                    print(f"Error uploading image {image_file.name}: {str(e)}")

        # Handle YouTube videos
        if youtube_urls:
            # First, mark all existing videos as not live
            instance.videos.update(live=False)

            # Create new videos
            for url in youtube_urls:
                Video.objects.create(
                    project=instance,
                    youtube_url=url,
                    live=True
                )

        return instance


class ProjectDeleteSerializer(serializers.ModelSerializer):
    """Serializer for deleting projects with proper cleanup"""

    class Meta:
        model = Projects
        fields = []  # No fields needed for deletion

    def validate(self, attrs):
        # Check if user has permission to delete
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            raise serializers.ValidationError("You do not have permission to delete projects.")
        return attrs

    def delete_images(self, project):
        """Delete all project images from Cloudinary and database"""
        from app.views.helpers.cloudinary import CloudinaryImageHandler
        uploader = CloudinaryImageHandler()

        success_messages = []
        error_messages = []
        images = list(project.images.all())

        for image in images:
            try:
                if image.cloudinary_image_id:
                    uploader.delete_image(image.cloudinary_image_id)
                image.delete()
                success_messages.append("Successfully deleted image.")
            except Exception as e:
                error_messages.append(f"Failed to delete image: {str(e)}")
                if len(error_messages) > 0:
                    raise serializers.ValidationError(error_messages)

        return success_messages

    def delete_videos(self, project):
        """Delete all project videos from database"""
        success_messages = []
        error_messages = []
        videos = list(project.videos.all())

        for video in videos:
            try:
                video.delete()
                success_messages.append("Successfully deleted video link.")
            except Exception as e:
                error_messages.append(f"Failed to delete video link: {str(e)}")
                if len(error_messages) > 0:
                    raise serializers.ValidationError(error_messages)

        return success_messages

    def delete_project(self, project):
        """Delete the project after all relations are cleaned up"""
        from django.db.models.deletion import ProtectedError

        try:
            project_title = project.title
            project.delete()
            return [f"Project '{project_title}' deleted successfully!"]
        except ProtectedError as pe:
            protected_objects = list(pe.protected_objects)
            protected_details = [
                f"{obj.__class__.__name__} (ID: {obj.pk})"
                for obj in protected_objects
            ]
            error_message = (
                f"Failed. Project still referenced by {len(protected_objects)} objects: "
                f"{', '.join(protected_details)}"
            )
            raise serializers.ValidationError(error_message)
        except Exception as e:
            raise serializers.ValidationError(f"Project deletion failed: {str(e)}")

    def delete(self, instance):
        """Handle the complete deletion process with rollback on failure"""
        success_messages = []

        try:
            with transaction.atomic():
                # Delete in proper order to handle dependencies
                success_messages.extend(self.delete_images(instance))
                success_messages.extend(self.delete_videos(instance))
                success_messages.extend(self.delete_project(instance))

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
