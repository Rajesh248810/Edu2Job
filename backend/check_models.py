import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

if not api_key:
    print("API Key not found in environment.")
    exit(1)

genai.configure(api_key=api_key)

print("Listing models...")
try:
    models = list(genai.list_models())
except Exception as e:
    print(f"Error listing models: {e}")
    exit(1)

# Filter for generation models
candidates = [m for m in models if 'generateContent' in m.supported_generation_methods]
candidate_names = [m.name for m in candidates]

print(f"Found {len(candidates)} candidate models.")

working_model = None

# Prioritize stable models if possible, but we just want *any* working one as per user request
# We will just try them in order.
for model_info in candidates:
    model_name = model_info.name
    print(f"Testing {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'Hello'")
        if response.text:
            print(f"SUCCESS: {model_name} works!")
            print(f"Response: {response.text}")
            working_model = model_name
            break
    except Exception as e:
        print(f"FAILED: {model_name} - {e}")

if working_model:
    # specific format adjustment if needed (remove 'models/' prefix if present for instantiation usually, 
    # but GenerativeModel accepts both. We will strip 'models/' to be clean if it exists)
    clean_name = working_model.replace("models/", "")
    print(f"RECOMMENDED_MODEL: {clean_name}")
else:
    print("NO WORKING MODEL FOUND.")
