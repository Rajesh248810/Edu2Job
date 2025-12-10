import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

try:
    from users.views import UserProfileUpdateView
    from users.serializers import UserSerializer
    print("Imports successful")
except Exception as e:
    print(f"Import failed: {e}")
