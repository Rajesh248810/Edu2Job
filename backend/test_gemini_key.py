
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
if api_key:
    print(f"Key loaded: {api_key[:5]}...{api_key[-5:]}")
else:
    print("Key loaded: None")

if not api_key:
    # Manual fallback for test
    api_key = "AIzaSyA0JzpZs2XQw7pcQnuHsD2zEooVDmNE0kQ"

try:
    genai.configure(api_key=api_key)
    print("Listing models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("Error:", e)
