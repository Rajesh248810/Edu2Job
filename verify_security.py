import requests

def test_security():
    base_url = "http://localhost:8000"
    
    # 1. Test Security Headers
    print("Testing Security Headers...")
    try:
        # We try a public endpoint
        resp = requests.get(base_url + "/api/debug/", timeout=5)
        headers = resp.headers
        print(f"X-Frame-Options: {headers.get('X-Frame-Options')}")
        print(f"X-Content-Type-Options: {headers.get('X-Content-Type-Options')}")
        print(f"X-XSS-Protection: {headers.get('X-XSS-Protection')}")
        print(f"Referrer-Policy: {headers.get('Referrer-Policy')}")
    except Exception as e:
        print(f"Header test failed (Server might not be running): {e}")

    # 2. Test Malicious User Agent Blocking
    print("\nTesting Malicious Agent Blocking...")
    try:
        headers = {'User-Agent': 'sqlmap/1.4.11'}
        resp = requests.get(base_url + "/api/debug/", headers=headers, timeout=5)
        if resp.status_code == 403:
            print("SUCCESS: sqlmap agent blocked (403 Forbidden)")
        else:
            print(f"FAILURE: sqlmap agent NOT blocked (Status: {resp.status_code})")
    except Exception as e:
        print(f"Agent test failed: {e}")

if __name__ == "__main__":
    test_security()
