import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

with connection.cursor() as cursor:
    try:
        cursor.execute("DESCRIBE user")
        columns = [col[0] for col in cursor.fetchall()]
        print(f"Columns in user table: {columns}")
        if 'profile_picture' in columns and 'banner_image' in columns:
            print("SUCCESS: Image columns exist.")
        else:
            print("FAILURE: Image columns missing.")
    except Exception as e:
        print(f"Error inspecting table: {e}")
