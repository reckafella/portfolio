from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.db import models

from blog.models import ViewCountAttempt


class Command(BaseCommand):
    help = 'Detect and report view count abuse patterns'

    def handle(self, *args, **options):
        # Find IPs with high failure rates
        yesterday = timezone.now() - timedelta(days=1)

        suspicious_ips = ViewCountAttempt.objects.filter(
            timestamp__gte=yesterday
        ).values('ip_address').annotate(
            total_attempts=Count('id'),
            failed_attempts=Count('id', filter=models.Q(success=False))
        ).filter(
            total_attempts__gt=50,  # More than 50 attempts
            failed_attempts__gt=40   # More than 40 failures
        )

        for ip_data in suspicious_ips:
            self.stdout.write(
                self.style.WARNING(
                    f"Suspicious IP: {ip_data['ip_address']} - "
                    f"{ip_data['failed_attempts']}/{ip_data['total_attempts']}"
                    " - failed attempts"
                )
            )
