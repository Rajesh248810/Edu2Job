
import os
import sys
import django
import pandas as pd

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Education, Skill, Certification
from ml_service.predict import predict_job

print("Imports successful")

try:
    # Fetch all student users
    users = User.objects.filter(role='student')
    print(f"Found {users.count()} students.")
    
    for user in users:
        print(f"\nTesting prediction for user: {user.name} ({user.email})")
        
        # Fetch profile data manually to mimic view
        education = Education.objects.filter(user=user).first()
        skills = Skill.objects.filter(user=user)
        certifications = Certification.objects.filter(user=user)
        
        profile = {
            'degree': education.degree if education else '',
            'specialization': education.specialization if education else '',
            'skills': ' '.join([s.skill_name for s in skills]),
            'certifications': ' '.join([c.cert_name for c in certifications])
        }
        
        print("Profile Data:", profile)
        
        # Call predict_job
        try:
            result = predict_job(profile)
            print("Prediction Result:", result)
        except Exception as e:
            print(f"CRASHED for user {user.email}: {e}")
            import traceback
            traceback.print_exc()

except Exception as e:
    print(f"Error during prediction test: {e}")
    import traceback
    traceback.print_exc()

print("Script completed")
