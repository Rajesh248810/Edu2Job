import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

email = 'admin@edu2job.com'
try:
    user = User.objects.get(email=email)
    print(f"User found: {user.email}")
    print(f"Role: '{user.role}'")
    
    # Ensure password is set (plain text as per LoginView logic)
    user.password_hash = 'admin123'
    user.save()
    print("Password reset to 'admin123'")

except User.DoesNotExist:
    print(f"User {email} not found. Creating...")
    user = User.objects.create(
        name='Admin User',
        email=email,
        password_hash='admin123',
        role='admin'
    )
    print(f"User {email} created successfully.")
