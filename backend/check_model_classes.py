import os
import django
import sys
import joblib
from django.conf import settings

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ml_service.predict import ROLE_SKILLS_MAPPING

model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'job_predictor.pkl')

if not os.path.exists(model_path):
    print("Model not found!")
else:
    try:
        clf = joblib.load(model_path)
        classes = clf.classes_
        print("Model Classes:", classes)
        
        print("\n--- Mismatch Check ---")
        mismatches = []
        for cls in classes:
            if cls not in ROLE_SKILLS_MAPPING:
                mismatches.append(cls)
        
        if mismatches:
            print("The following model classes are NOT in ROLE_SKILLS_MAPPING:")
            for m in mismatches:
                print(f"- '{m}'")
        else:
            print("All model classes exist in ROLE_SKILLS_MAPPING.")
            
    except Exception as e:
        print(f"Error loading model: {e}")
