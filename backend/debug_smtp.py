
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
import smtplib

print("--- SMTP Debugger ---")
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")

# Check credentials (safely)
if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
    print("ERROR: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is missing in settings!")
else:
    print("Credentials seem to be present.")

try:
    print("\nAttempting to connect to SMTP server...")
    if settings.EMAIL_USE_SSL:
        server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
    else:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        if settings.EMAIL_USE_TLS:
            server.starttls()
    
    print("Connection established. Attempting login...")
    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
    print("Login successful!")
    server.quit()

    print("\nAttempting to send email via Django send_mail...")
    send_mail(
        subject="Edu2Job SMTP Debug Test",
        message="This is a test email to verify SMTP configuration.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['sahoogyanaranjan353@gmail.com'], # Sending to developer/user
        fail_silently=False
    )
    print("SUCCESS: Test email sent via Django!")

except Exception as e:
    print("\nFAILED:")
    print(str(e))
    import traceback
    traceback.print_exc()
