import os
from dotenv import load_dotenv, find_dotenv
from pathlib import Path

# Mimic settings.py logic exactly first
BASE_DIR = Path(__file__).resolve().parent
print(f"BASE_DIR calculated as: {BASE_DIR}")
env_path = os.path.join(BASE_DIR, '.env')
print(f"Looking for .env at: {env_path}")

if os.path.exists(env_path):
    print(".env file EXISTS.")
    # Read raw content to check minimal validity (without leaking key)
    try:
        with open(env_path, 'r') as f:
            lines = f.readlines()
            print(f"File has {len(lines)} lines.")
            found_key = False
            for line in lines:
                if line.strip().startswith('GEMINI_API_KEY'):
                    found_key = True
                    parts = line.split('=')
                    if len(parts) > 1:
                        val = parts[1].strip()
                        print(f"Found GEMINI_API_KEY line. Value length: {len(val)}")
                        if len(val) < 20: 
                             print("WARNING: Key seems very short!")
                    else:
                        print("WARNING: GEMINI_API_KEY found but no value assign.")
            if not found_key:
                print("WARNING: 'GEMINI_API_KEY' string not found in file.")
    except Exception as e:
        print(f"Error reading file: {e}")
        
    print("Attempting to load_dotenv...")
    load_dotenv(env_path, override=True)
    key = os.environ.get('GEMINI_API_KEY')
    if key:
        print(f"SUCCESS: GEMINI_API_KEY loaded in environment. Length: {len(key)}")
    else:
        print("FAILURE: load_dotenv called but GEMINI_API_KEY not in os.environ.")
else:
    print(".env file DOES NOT EXIST at expected path.")
