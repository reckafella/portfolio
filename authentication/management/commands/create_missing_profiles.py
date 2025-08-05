from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from authentication.models import Profile, SocialLinks, UserSettings


class Command(BaseCommand):
    help = 'Creates missing profiles for existing users'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        created_profiles = 0
        created_social_links = 0
        created_settings = 0

        for user in users:
            # Create profile if missing
            profile, profile_created = Profile.objects.get_or_create(
                user=user,
                defaults={'bio': ''}
            )
            if profile_created:
                created_profiles += 1

            # Create social links if missing
            social, social_created = SocialLinks.objects.get_or_create(
                profile=profile,
                defaults={}
            )
            if social_created:
                created_social_links += 1

            # Create settings if missing
            settings, settings_created = UserSettings.objects.get_or_create(
                user=user,
                defaults={
                    'changes_notifications': True,
                    'new_products_notifications': True,
                    'marketing_notifications': False,
                    'security_notifications': True
                }
            )
            if settings_created:
                created_settings += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_profiles} profiles, '
                f'{created_social_links} social links sets, and '
                f'{created_settings} settings objects'
            )
        )
