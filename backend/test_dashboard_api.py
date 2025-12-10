import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin@edu2job.com"
ADMIN_PASSWORD = "admin" # Assuming default or known password, otherwise we can't test login. 
# Since I can't know the password, I will assume I can use the token if I can generate one, 
# or I will just use the user_id if the endpoint is open.
# The endpoint /api/dashboard/?user_id=... is open (no permissions checked in view).

def test_dashboard_api():
    print("Testing Dashboard API...")
    
    # 1. Get Admin User ID (Hardcoded from previous check: 60)
    admin_user_id = 60
    
    # 2. Call Dashboard API
    url = f"{BASE_URL}/api/dashboard/?user_id={admin_user_id}"
    print(f"GET {url}")
    
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2))
            
            if data.get('role') == 'admin':
                print("SUCCESS: Role is 'admin'")
            else:
                print(f"FAILURE: Role is '{data.get('role')}'")
        else:
            print("Failed to fetch data")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_dashboard_api()
