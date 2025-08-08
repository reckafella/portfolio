"""
Management command to migrate existing BlogPostImage data to Wagtail image
system.
This command moves images from the legacy BlogPostImage model to the new
CloudinaryWagtailImage and BlogPostPageGalleryImage models.
"""

import logging

from django.core.management.base import BaseCommand
from django.db import transaction

from blog.models import BlogPostImage, BlogPostPage, BlogPostPageGalleryImage
from blog.wagtail_models import CloudinaryWagtailImage

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Migrate existing BlogPostImage data to Wagtail image system"

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it',
        )
        parser.add_argument(
            '--post-id',
            type=int,
            help='Migrate images for a specific post ID only',
        )

    def handle(self, **options):
        dry_run = options['dry_run']
        post_id = options.get('post_id')

        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )

        blog_posts = self._get_blog_posts(post_id)
        if blog_posts is None:
            return

        total_posts = blog_posts.count()
        self.stdout.write(f'Found {total_posts} blog posts to process')

        migrated_images, errors = self._process_blog_posts(blog_posts, dry_run)
        self._print_summary(total_posts, migrated_images, errors, dry_run)

    def _get_blog_posts(self, post_id):
        """Get blog posts to migrate based on post_id filter"""
        if post_id:
            blog_posts = BlogPostPage.objects.filter(id=post_id)
            if not blog_posts.exists():
                self.stdout.write(
                    self.style.ERROR(f'No blog post found with ID {post_id}')
                )
                return None
        else:
            blog_posts = BlogPostPage.objects.all()
        return blog_posts

    def _process_blog_posts(self, blog_posts, dry_run):
        """Process all blog posts and migrate their images"""
        migrated_images = 0
        errors = 0

        for post in blog_posts:
            post_migrated, post_errors = self._process_single_post(post, dry_run)
            migrated_images += post_migrated
            errors += post_errors

        return migrated_images, errors

    def _process_single_post(self, post, dry_run):
        """Process images for a single blog post"""
        self.stdout.write(f'\nProcessing post: {post.title}')

        legacy_images = BlogPostImage.objects.filter(post=post)
        if not legacy_images.exists():
            self.stdout.write('  No legacy images found')
            return 0, 0

        self.stdout.write(f'  Found {legacy_images.count()} legacy images')

        migrated_images = 0
        errors = 0

        for legacy_image in legacy_images:
            try:
                if not dry_run:
                    success = self._migrate_image(legacy_image, post)
                    if success:
                        migrated_images += 1
                    else:
                        errors += 1
                else:
                    self.stdout.write(
                        f'    Would migrate: '
                        f'{legacy_image.cloudinary_image_id}'
                    )
                    migrated_images += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'    Error migrating image {legacy_image.id}: {e}'
                    )
                )
                errors += 1

        return migrated_images, errors

    def _print_summary(self, total_posts, migrated_images, errors, dry_run):
        """Print migration summary"""
        self.stdout.write('\nMigration Summary:')
        self.stdout.write(f'  Posts processed: {total_posts}')
        self.stdout.write(f'  Images migrated: {migrated_images}')
        if errors:
            self.stdout.write(self.style.ERROR(f'  Errors: {errors}'))

        if not dry_run:
            self.stdout.write(self.style.SUCCESS('Migration completed!'))
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Dry run completed. Use without --dry-run to migrate.'
                )
            )

    @transaction.atomic
    def _migrate_image(self, legacy_image, post):
        """Migrate a single BlogPostImage to the new system"""
        try:
            # Check if this image was already migrated
            existing_gallery_image = BlogPostPageGalleryImage.objects.filter(
                page=post,
                image__cloudinary_image_id=legacy_image.cloudinary_image_id
            ).first()

            if existing_gallery_image:
                self.stdout.write(
                    f'    Already migrated: {legacy_image.cloudinary_image_id}'
                )
                return True

            # Create CloudinaryWagtailImage with proper defaults
            image_model = CloudinaryWagtailImage.objects
            wagtail_image, created = image_model.get_or_create(
                cloudinary_image_id=legacy_image.cloudinary_image_id,
                defaults={
                    'title': f"Image for {post.title}",
                    'cloudinary_image_url': legacy_image.cloudinary_image_url,
                    'optimized_image_url': legacy_image.optimized_image_url,
                    'width': 800,  # Default width
                    'height': 600,  # Default height
                    'focal_point_x': None,
                    'focal_point_y': None,
                    'focal_point_width': None,
                    'focal_point_height': None,
                    'file_size': None,
                }
            )

            if created:
                msg = '    Created CloudinaryWagtailImage: '
                msg += f'{wagtail_image.title}'
                self.stdout.write(msg)
            else:
                msg = '    Reusing existing CloudinaryWagtailImage: '
                msg += f'{wagtail_image.title}'
                self.stdout.write(msg)

            # Create BlogPostPageGalleryImage relationship
            BlogPostPageGalleryImage.objects.create(
                page=post,
                image=wagtail_image,
                caption=f"Migrated from legacy image {legacy_image.id}"
            )

            self.stdout.write(
                f'    Created gallery relationship for post: {post.title}'
            )

            return True

        except Exception as e:
            logger.error(f"Failed to migrate image {legacy_image.id}: {e}")
            raise  # Re-raise to trigger transaction rollback

    def _update_cover_image(self, post):
        """Update the post's cover image to use the first gallery image"""
        first_gallery_image = post.gallery_images.first()
        if first_gallery_image and first_gallery_image.image:
            # Update legacy fields for backward compatibility
            image = first_gallery_image.image
            post.cloudinary_image_id = image.cloudinary_image_id
            post.cloudinary_image_url = image.cloudinary_image_url
            post.optimized_image_url = image.optimized_image_url
            post.save()

            self.stdout.write(
                f'    Updated cover image for: {post.title}'
            )
