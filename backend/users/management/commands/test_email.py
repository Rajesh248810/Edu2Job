from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import traceback

class Command(BaseCommand):
    help = 'Test SMTP Configuration interactively'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting Email Test..."))
        
        # 1. Print Config
        self.stdout.write(f"HOST: {getattr(settings, 'EMAIL_HOST', 'Not Set')}")
        self.stdout.write(f"PORT: {getattr(settings, 'EMAIL_PORT', 'Not Set')}")
        self.stdout.write(f"USER: {getattr(settings, 'EMAIL_HOST_USER', 'Not Set')}")
        self.stdout.write(f"USE_SSL: {getattr(settings, 'EMAIL_USE_SSL', 'Not Set')}")
        self.stdout.write(f"USE_TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not Set')}")
        
        # 2. Try Sending
        try:
            self.stdout.write("Attempting connection...")
            send_mail(
                subject='CLI Test Email',
                message='This email proves the management command works.',
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', getattr(settings, 'EMAIL_HOST_USER', 'unknown')),
                recipient_list=['sahoogyanaranjan353@gmail.com'],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS("SUCCESS: Email Sent!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"FAILED: {e}"))
            self.stdout.write(traceback.format_exc())
