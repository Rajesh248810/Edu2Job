import os
import django
from pathlib import Path

# Setup Django (optional but good for context)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
try:
    django.setup()
    from django.conf import settings
    base_dir = settings.BASE_DIR
    print(f"Django BASE_DIR: {base_dir}")
except:
    print("Could not setup Django, falling back to os.getcwd()")
    base_dir = os.getcwd()

print(f"Current Working Directory: {os.getcwd()}")

# List root backend directory
print("\n--- Listing backend directory ---")
try:
    print(os.listdir(base_dir))
except Exception as e:
    print(f"Error listing base_dir: {e}")

# Check ml_models directory
ml_models_path = os.path.join(base_dir, 'ml_models')
print(f"\n--- Checking ml_models at: {ml_models_path} ---")

if os.path.exists(ml_models_path):
    print("Directory exists. Contents:")
    print(os.listdir(ml_models_path))
else:
    print("Directory DOES NOT EXIST.")

# Check specific file
model_file = os.path.join(ml_models_path, 'job_predictor.pkl')
print(f"\n--- Checking model file at: {model_file} ---")
if os.path.exists(model_file):
    print("FILE EXISTS!")
else:
    print("FILE NOT FOUND.")
