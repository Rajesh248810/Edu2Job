import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ml_service.predict import predict_job

# Test Case 1: Frontend Developer
profile1 = {
    "degree": "B.Tech",
    "specialization": "Computer Science",
    "skills": "HTML, CSS, JavaScript, React, Redux",
    "certifications": "Meta Frontend Developer"
}

# Test Case 2: Data Scientist
profile2 = {
    "degree": "M.Tech",
    "specialization": "Data Science",
    "skills": "Python, Machine Learning, SQL, Pandas, NumPy",
    "certifications": ""
}

print("Testing Prediction for Frontend Profile...")
result1 = predict_job(profile1)
print(result1)

print("\nTesting Prediction for Data Science Profile...")
result2 = predict_job(profile2)
print(result2)
