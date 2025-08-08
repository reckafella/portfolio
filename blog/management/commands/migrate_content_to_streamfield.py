"""
Management command to migrate existing RichText content to StreamField format
"""
from django.core.management.base import BaseCommand

from blog.models import BlogPostPage


class Command(BaseCommand):
    help = 'Migrate existing RichText content to StreamField format'

    def add_arguments(self, parser):
        parser.add_argument(
            '--post-id',
            type=int,
            help='Migrate specific post by ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without making changes',
        )

    def handle(self, *args, **options):
        if options['post_id']:
            try:
                posts = [BlogPostPage.objects.get(id=options['post_id'])]
            except BlogPostPage.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(
                        f"Post with ID {options['post_id']} not found"
                    )
                )
                return
        else:
            # Get all posts that have content but no stream_content
            posts = BlogPostPage.objects.filter(
                content__isnull=False,
                stream_content__isnull=True
            ).exclude(content='')

        if not posts:
            self.stdout.write(
                self.style.SUCCESS("No posts need migration")
            )
            return

        self.stdout.write(
            f"Found {len(posts)} posts to migrate"
        )

        for post in posts:
            if options['dry_run']:
                self.stdout.write(
                    f"Would migrate: {post.title} (ID: {post.id})"
                )
                self.stdout.write(f"  Content preview: "
                                  f"{post.content[:100]}...")
            else:
                # Convert RichText to StreamField
                # Start with a basic rich text block
                stream_data = [
                    {
                        'type': 'rich_text',
                        'value': post.content
                    }
                ]

                # Save the current content to legacy_content
                post.legacy_content = post.content

                # Set the new StreamField content
                post.stream_content = stream_data

                # Save the post
                post.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Migrated: {post.title} (ID: {post.id})"
                    )
                )

        if not options['dry_run']:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully migrated {len(posts)} posts"
                )
            )
            self.stdout.write(
                "Note: You can now edit posts to add inline images and "
                "other rich content blocks"
            )
        else:
            self.stdout.write(
                "This was a dry run. Use without --dry-run to actually "
                "migrate the content"
            )
