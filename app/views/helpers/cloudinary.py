import cloudinary
import cloudinary.uploader
from django.conf import settings
from django.utils.text import slugify


class CloudinaryImageHandler:
    """
    Class to handle Cloudinary Image Upload and Delete operations.
    """

    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )

    def upload_image(
        self,
        image,
        folder=None,
        public_id=None,
        tags=None,
        overwrite=True,
        metadata=None,
    ) -> dict:
        """
        Upload an image to Cloudinary and return the result.

        Args:
            image: The image to upload.
            folder: The folder to upload the image to.
            public_id: The public ID of the image.
            tags: The tags to add to the image.
            overwrite: Whether to overwrite the image if it already exists.
            metadata: The metadata to add to the image.
        """
        # Validate image before upload (size, type, etc.)
        if image.size > settings.MAX_UPLOAD_SIZE:
            raise ValueError("Image is too large. Maximum size is 5MB")

        # Validate image type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            raise ValueError(
                "Unsupported image type. Supported types are: JPEG, PNG, GIF, and WebP"
            )

        try:
            options = {
                "folder": folder,
                "public_id": public_id,
                "tags": tags,
                "overwrite": overwrite,
                "metadata": metadata,
            }
            options = {k: v for k, v in options.items() if v is not None}

            response = cloudinary.uploader.upload(image, **options)
        except cloudinary.exceptions.Error as cloud_error:
            raise Exception(f"Cloudinary Error: {str(cloud_error)}")
        except ValueError as val_error:
            raise Exception(f"Validation Error: {str(val_error)}")
        except Exception as e:
            raise Exception(f"Error uploading image to Cloudinary: {str(e)}")
        return response

    def delete_image(self, public_id: str) -> dict:
        """
        Delete an image from Cloudinary and return the result.
        """
        try:
            response = cloudinary.uploader.destroy(public_id, invalidate=True)
        except Exception as e:
            raise Exception(f"Error deleting image from Cloudinary: {str(e)}")
        return response

    def get_optim_url(self, image_id: str) -> str:
        """
        Generate an optimized image URL for Cloudinary.
        """
        image = cloudinary.CloudinaryImage(image_id)
        return image.build_url(quality="auto", fetch_format="auto").replace(
            "http://", "https://"
        )

    def get_public_id(self, title: str) -> str:
        """
        Generate a public ID for the image uploaded to Cloudinary.
        """
        return slugify(title)


def handle_image_upload(instance, uploader, image, folder):
    """
    Handle image upload for a model instance.

    Args:
        instance: The Project/Blog post Model instance to upload the image for.
        image: The image to upload
        folder: The folder to upload the image to.

    Returns:
        dict: A dictionary containing the image upload response or None if no upload occurred.
    """
    if not image:
        return None

    try:
        image_data = uploader.upload_image(
            image,
            folder=folder,
            public_id=uploader.get_public_id(instance.title),
            overwrite=True,
        )
        if instance.cloudinary_image_id:
            uploader.delete_image(instance.cloudinary_image_id)

        return {
            "cloudinary_image_id": image_data["public_id"],
            "cloudinary_image_url": image_data["secure_url"],
            "optimized_image_url": uploader.get_optim_url(image_data["public_id"]),
        }
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        raise Exception(f"Error uploading image: {str(e)}")
