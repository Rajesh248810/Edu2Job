import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def check_users():
    print("Checking Users...")
    users = User.objects.all()
    for u in users:
        print(f"ID: {u.user_id}, Name: {u.name}, Email: {u.email}, Role: {u.role}")

if __name__ == "__main__":
    check_users()
