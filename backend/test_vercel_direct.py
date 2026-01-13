import requests
import json

# Configuration
VERCEL_URL = "https://edu2-job-email.vercel.app"
API_SECRET = "my_secret_key_123" # Updated with user provided secret
RECIPIENT_EMAIL = "sahoogyanaranjan353@gmail.com"

def test_direct_email():
    endpoint = f"{VERCEL_URL}/send-email"
    
    payload = {
        "to": RECIPIENT_EMAIL,
        "subject": "Direct Vercel Test 🚀",
        "body": "<h1>It Works!</h1><p>This email was sent directly via your Vercel microservice.</p>",
        "type": "html"
    }
    
    headers = {
        "Authorization": f"Bearer {API_SECRET}",
        "Content-Type": "application/json"
    }

    print(f"Testing Vercel Service: {endpoint}")
    print(f"Recipient: {RECIPIENT_EMAIL}")
    print("-" * 30)

    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("\nSUCCESS: Email sent successfully!")
        elif response.status_code == 401:
            print("\nFAILED: Unauthorized. Did you set a custom API_SECRET env var on Vercel?")
            print(f"Current Secret being used: {API_SECRET}")
        else:
            print("\nFAILED: Check the error message above.")

    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test_direct_email()
