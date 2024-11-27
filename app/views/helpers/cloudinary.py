import uuid
import cloudinary
import cloudinary.uploader
from django.conf import settings


class CloudinaryImageHandler:
    """
    Class to handle Cloudinary Image Upload and Delete operations.
    """
    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )

    def upload_image(self, image, folder=None, public_id=None, tags=None, overwrite=True, metadata=None) -> dict:
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
        try:
            options = {
                "folder": folder,
                "public_id": public_id,
                "tags": tags,
                "overwrite": overwrite,
                "metadata": metadata
            }
            options = {k: v for k, v in options.items() if v is not None}
            response = cloudinary.uploader.upload(image, **options)
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


def generate_cloudinary_url(public_id: str, transformation: dict = None) -> str:
    """
    Generate a Cloudinary URL for the given public ID and transformation.
    """
    transformation = transformation or {}
    return cloudinary.CloudinaryImage(public_id).build_url(**transformation)


def generate_cloudinary_public_id() -> str:
    """
    Generate a random public ID for Cloudinary.
    """
    return str(uuid.uuid4())
