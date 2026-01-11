
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

try:
    import google.generativeai as genai
    print("SUCCESS: google.generativeai imported")
except ImportError as e:
    print(f"ERROR: Could not import google.generativeai: {e}")

try:
    from users.gemini_service import get_gemini_suggestions
    print("SUCCESS: gemini_service imported")
except ImportError as e:
    print(f"ERROR: Could not import gemini_service: {e}")
except Exception as e:
    print(f"ERROR: Error importing gemini_service: {e}")
