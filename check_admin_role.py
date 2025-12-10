import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

try:
    user = User.objects.get(email='admin@example.com')
    print(f"User found: {user.email}")
    print(f"Role: '{user.role}'")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
except User.DoesNotExist:
    print("User admin@example.com not found")
