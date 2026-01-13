import os
import django
import time
import sys

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.utils import send_prediction_email
from django.conf import settings

class MockUser:
    def __init__(self, email, name):
        self.email = email
        self.name = name

def test_email():
    # Target email from the user's previous request context or default
    target_email = 'sahoogyanaranjan353@gmail.com'
    
    # Force configuration for this test as requested by user
    # settings.EMAIL_PORT = 465
    # settings.EMAIL_USE_SSL = True
    # settings.EMAIL_USE_TLS = False
    
    print(f"Testing Email Microservice Configuration...")
    print(f"URL: {getattr(settings, 'EMAIL_MICROSERVICE_URL', 'Not Set')}")
    print(f"Secret: {getattr(settings, 'EMAIL_MICROSERVICE_SECRET', 'Not Set')[:5]}***")
    print("-" * 30)

    # Mock Data
    mock_user = MockUser(email=target_email, name="Developer")
    
    mock_result = {
        'predictions': [
            {'role': 'Full Stack Developer', 'confidence': 0.95},
            {'role': 'Backend Engineer', 'confidence': 0.88}
        ]
    }

    try:
        print(f"Attempting to send predicted job email to {target_email}...")
        send_prediction_email(mock_user, mock_result)
        
        # Since utils.py uses threading, we need to wait a bit to ensure log output appears
        print("Email queued in thread. Waiting 5 seconds for completion...")
        time.sleep(5)
        print("Test script finished.")
        
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_email()
