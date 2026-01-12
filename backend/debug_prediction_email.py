import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.utils import send_prediction_email
import time

class MockUser:
    def __init__(self):
        self.name = "Test User"
        self.email = "sahoogyanaranjan353@gmail.com" # Using the user's email for verification

def test_email():
    user = MockUser()
    mock_result = {
        'predictions': [
            {'role': 'AI Engineer', 'confidence': 0.95},
            {'role': 'Data Scientist', 'confidence': 0.85}
        ]
    }
    
    print("Testing send_prediction_email...")
    try:
        send_prediction_email(user, mock_result)
        print("Function called successfully. Waiting for thread...")
        # Give the thread time to execute since the script main thread might exit
        time.sleep(10) 
        print("Done waiting.")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    test_email()
