
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Adminlogs
from ml_service.train import train_model

print("Imports successful")

try:
    # Try to fetch a user that might be the admin
    # I don't know the admin email, so I'll list all users with role 'admin'
    admins = User.objects.filter(role='admin')
    print(f"Found {admins.count()} admins:")
    for admin in admins:
        print(f" - {admin.name} ({admin.email})")
        
        # Simulate the lookup done in the view
        try:
            u = User.objects.get(email=admin.email)
            print(f"   Lookup by email '{admin.email}' successful: {u}")
        except Exception as e:
            print(f"   Lookup by email '{admin.email}' FAILED: {e}")

except Exception as e:
    print(f"Error querying users: {e}")

print("Script completed")
