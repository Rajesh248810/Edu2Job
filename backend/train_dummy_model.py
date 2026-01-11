import os
import django
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
try:
    django.setup()
    from django.conf import settings
    base_dir = settings.BASE_DIR
except:
    base_dir = os.path.dirname(os.path.abspath(__file__))

# Sample Training Data
data = [
    # Software Engineering
    ["Computer Science", "Software Engineering", "Python, Django, SQL, Git", "AWS Certified Developer", "Software Engineer"],
    ["Information Technology", "Web Development", "HTML, CSS, JavaScript, React", "None", "Frontend Developer"],
    ["Computer Science", "Data Science", "Python, Pandas, NumPy, SQL", "Google Data Analytics", "Data Scientist"],
    ["Computer Applications", "Backend", "Node.js, Express, MongoDB", "None", "Backend Developer"],
    # ... (Add more rows if needed)
]

# Create DataFrame
df = pd.DataFrame(data, columns=['degree', 'specialization', 'skills', 'certifications', 'target_job_role'])

# Feature Engineering
df['text_features'] = df['skills'] + " " + df['certifications']

# Train Model
pipeline = Pipeline([
    ('vectorizer', CountVectorizer()),
    ('classifier', LogisticRegression())
])

X = df['text_features']
y = df['target_job_role']

pipeline.fit(X, y)

# Save Model
model_dir = os.path.join(base_dir, 'ml_models')
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'job_predictor.pkl')

joblib.dump(pipeline, model_path)
print(f"Model trained and saved to: {model_path}")
