"""
Custom Wagtail models for blog image management with Cloudinary integration
"""
import logging

from django.conf import settings
from django.db import models
from wagtail.images.models import AbstractImage, AbstractRendition, Image

from app.views.helpers.cloudinary import CloudinaryImageHandler

logger = logging.getLogger(__name__)


class CloudinaryWagtailImage(AbstractImage):
    """
    Custom Wagtail image model that uses Cloudinary for storage
    Integrates with the existing CloudinaryImageHandler
    """

    # Store Cloudinary-specific data
    cloudinary_image_id = models.CharField(
        max_length=255, blank=True, null=True
    )
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    admin_form_fields = Image.admin_form_fields + (
        'cloudinary_image_id',
        'cloudinary_image_url',
        'optimized_image_url',
    )

    def save(self, *args, **kwargs):
        """Override save to upload to Cloudinary when image is added"""
        upload_to_cloudinary = kwargs.pop('upload_to_cloudinary', True)

        if self.file and upload_to_cloudinary and not self.cloudinary_image_id:
            # Upload to Cloudinary using your custom handler
            uploader = CloudinaryImageHandler()
            try:
                # Use blog posts folder structure matching existing pattern
                folder = (
                    settings.POSTS_FOLDER
                    if hasattr(settings, 'POSTS_FOLDER')
                    else "portfolio/posts/dev"
                )

                response = uploader.upload_image(self.file, folder=folder)

                self.cloudinary_image_id = response.get('cloudinary_image_id')
                self.cloudinary_image_url = response.get(
                    'cloudinary_image_url'
                )
                self.optimized_image_url = response.get(
                    'optimized_image_url'
                )

                msg = "Successfully uploaded image to Cloudinary: "
                msg += f"{self.cloudinary_image_id}"
                logger.info(msg)

            except Exception as e:
                error_msg = "Cloudinary upload failed for image "
                error_msg += f"{self.title}: {e}"
                logger.error(error_msg)
                # Don't prevent saving - allow local storage as fallback

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Override delete to remove from Cloudinary"""
        if self.cloudinary_image_id:
            uploader = CloudinaryImageHandler()
            try:
                uploader.delete_image(self.cloudinary_image_id)
                msg = "Successfully deleted image from Cloudinary: "
                msg += f"{self.cloudinary_image_id}"
                logger.info(msg)
            except Exception as e:
                error_msg = "Cloudinary deletion failed for image "
                error_msg += f"{self.cloudinary_image_id}: {e}"
                logger.error(error_msg)

        super().delete(*args, **kwargs)

    def get_optimized_url(self, filter_spec=None):
        """Get optimized URL with optional Wagtail filter spec conversion"""
        if self.optimized_image_url:
            if filter_spec:
                # Apply Wagtail-style transformations to Cloudinary URL
                return self._apply_cloudinary_transformations(
                    self.optimized_image_url,
                    filter_spec
                )
            return self.optimized_image_url
        elif self.cloudinary_image_url:
            return self.cloudinary_image_url
        return self.file.url if self.file else ''

    @property
    def url(self):
        """Override url property to handle Cloudinary images without files"""
        if self.optimized_image_url:
            return self.optimized_image_url
        elif self.cloudinary_image_url:
            return self.cloudinary_image_url
        elif self.file:
            return self.file.url
        return ''

    def get_rendition(self, filter):
        """Override get_rendition to handle Cloudinary images"""
        # For Cloudinary images without local files, return a rendition
        # that uses Cloudinary transformations
        if not self.file and self.cloudinary_image_url:
            # Handle both Filter objects and string filter specs
            if hasattr(filter, 'spec'):
                filter_spec = filter.spec
            else:
                filter_spec = str(filter)

            # Create or get a rendition for this filter
            rendition_model = CloudinaryWagtailRendition.objects
            rendition, created = rendition_model.get_or_create(
                image=self,
                filter_spec=filter_spec,
                focal_point_key=self.get_focal_point() or '',
                defaults={
                    'width': self.width,
                    'height': self.height,
                    'file': None,  # No local file for Cloudinary-only images
                }
            )
            return rendition
        else:
            # Use default Wagtail behavior for images with local files
            return super().get_rendition(filter)

    def _apply_cloudinary_transformations(self, url, filter_spec):
        """Convert Wagtail filter specs to Cloudinary transformations"""
        transformations = []

        # Parse common Wagtail filters and convert to Cloudinary syntax
        if 'fill-' in filter_spec:
            # Extract dimensions from fill-300x200
            size_part = filter_spec.split('fill-')[1].split('|')[0]
            if 'x' in size_part:
                width, height = size_part.split('x')
                transformations.append(f"c_fill,w_{width},h_{height}")

        elif 'width-' in filter_spec:
            width = filter_spec.split('width-')[1].split('|')[0]
            transformations.append(f"w_{width}")

        elif 'height-' in filter_spec:
            height = filter_spec.split('height-')[1].split('|')[0]
            transformations.append(f"h_{height}")

        if 'jpegquality-' in filter_spec:
            quality = filter_spec.split('jpegquality-')[1].split('|')[0]
            transformations.append(f"q_{quality}")

        if transformations:
            # Insert transformations into Cloudinary URL
            transform_string = ','.join(transformations)
            return url.replace('/upload/', f'/upload/{transform_string}/')

        return url

    def __str__(self):
        status = '✓' if self.cloudinary_image_id else '✗'
        return f"{self.title} (Cloudinary: {status})"


class CloudinaryWagtailRendition(AbstractRendition):
    """Custom rendition model for Cloudinary images"""
    image = models.ForeignKey(
        CloudinaryWagtailImage,
        on_delete=models.CASCADE,
        related_name='renditions'
    )

    @property
    def url(self):
        """Return URL for this rendition, preferring Cloudinary"""
        if self.file:
            return self.file.url
        elif (hasattr(self.image, 'optimized_image_url') and
              self.image.optimized_image_url):
            # Apply filter transformations to Cloudinary URL if needed
            if self.filter_spec:
                return self.image._apply_cloudinary_transformations(
                    self.image.optimized_image_url,
                    self.filter_spec
                )
            return self.image.optimized_image_url
        elif (hasattr(self.image, 'cloudinary_image_url') and
              self.image.cloudinary_image_url):
            return self.image.cloudinary_image_url
        return ''

    class Meta:
        unique_together = (
            ('image', 'filter_spec', 'focal_point_key'),
        )
