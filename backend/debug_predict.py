import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ml_service.predict import predict_job, ROLE_SKILLS_MAPPING

# Mock user profile with limited skills to force missing skills
test_profile = {
    'degree': 'B.Tech',
    'specialization': 'Computer Science',
    'skills': 'Python, SQL', # Intentionally missing many skills
    'certifications': ''
}

print("Testing Prediction with profile:", test_profile)
try:
    result = predict_job(test_profile)
    if 'error' in result:
        print("Error:", result['error'])
    else:
        predictions = result['predictions']
        print(f"\nTop Prediction: {predictions[0]['role']}")
        print(f"Confidence: {predictions[0]['confidence']}%")
        print(f"Missing Skills: {predictions[0].get('missing_skills')}")
        
        # Check if role exists in mapping
        role = predictions[0]['role']
        if role in ROLE_SKILLS_MAPPING:
            print(f"\nRole '{role}' found in mapping.")
            print(f"Required: {ROLE_SKILLS_MAPPING[role]}")
        else:
            print(f"\nWARNING: Role '{role}' NOT found in ROLE_SKILLS_MAPPING keys!")
            print("Available keys:", list(ROLE_SKILLS_MAPPING.keys())[:5], "...")

except Exception as e:
    print(f"Exception: {e}")
