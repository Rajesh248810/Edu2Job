
import requests
import json

url = "http://127.0.0.1:8000/api/predict/"
data = {"user_id": 1}  # Assuming user_id 1 exists

try:
    print(f"Sending POST request to {url} with data {data}")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
