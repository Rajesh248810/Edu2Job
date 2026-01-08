import os
import sys
import django

# Setup Django environment if run as a script
if __name__ == '__main__':
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib
from django.conf import settings
from users.models import TrainingData, JobPlacement, User, Predictionhistory

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def train_model():
    print("Starting model training...")
    
    # 1. Fetch Synthetic/Manual Data
    # 1. Fetch Synthetic/Manual Data
    # Fetch all records from TrainingData table
    synthetic_queryset = TrainingData.objects.all().values('degree', 'specialization', 'skills', 'certifications', 'target_job_role')
    df_synthetic = pd.DataFrame(list(synthetic_queryset))
    print(f"Loaded {len(df_synthetic)} records from TrainingData.")

    # 1.5 Fetch Feedback Data (Corrected Predictions)
    feedback_data = []
    # Fetch logs that are flagged and have a corrected role
    feedback_logs = Predictionhistory.objects.filter(is_flagged=True).exclude(corrected_role__isnull=True).exclude(corrected_role__exact='').select_related('user')
    
    for log in feedback_logs:
        user = log.user
        # Get latest education
        education = user.education_set.first()
        if not education:
            continue
            
        # Get skills and certs
        skills = [s.skill_name for s in user.skills.all()]
        certs = [c.cert_name for c in user.certification_set.all()]
        
        feedback_data.append({
            'degree': education.degree,
            'specialization': education.specialization,
            'skills': ", ".join(skills),
            'certifications': ", ".join(certs),
            'target_job_role': log.corrected_role # Use the ADMIN CORRECTED role
        })
        
    df_feedback = pd.DataFrame(feedback_data)
    print(f"Loaded {len(df_feedback)} records from PredictionFeedback (Admin Corrections).")

    # 2. Fetch Real-world Placement Data
    real_data = []
    placements = JobPlacement.objects.select_related('user').all()
    
    for placement in placements:
        user = placement.user
        # Get latest education
        education = user.education_set.first()
        if not education:
            continue # Skip if no education data
            
        # Get skills and certs
        skills = [s.skill_name for s in user.skills.all()]
        certs = [c.cert_name for c in user.certification_set.all()]
        
        real_data.append({
            'degree': education.degree,
            'specialization': education.specialization,
            'skills': ", ".join(skills),
            'certifications': ", ".join(certs),
            'target_job_role': placement.role
        })
    
    df_real = pd.DataFrame(real_data)
    print(f"Loaded {len(df_real)} records from JobPlacement (Real Data).")
    
    # 3. Combine Datasets
    if df_synthetic.empty and df_real.empty and df_feedback.empty:
        print("No training data found.")
        return {"status": "error", "message": "No training data found in database."}
        
    df = pd.concat([df_synthetic, df_real, df_feedback], ignore_index=True)
    print(f"Total training samples: {len(df)}")
    
    # 4. Preprocessing
    # Features: Degree, Specialization, Skills, Certifications
    # Target: Job_Role
    
    # Combine text features for TF-IDF
    df['text_features'] = df['skills'] + " " + df['certifications']
    
    # Categorical features
    categorical_features = ['degree', 'specialization']
    text_features = 'text_features'
    
    # Define Transformers
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    text_transformer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, categorical_features),
            ('text', text_transformer, text_features)
        ]
    )
    
    # 5. Pipeline
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])
    
    # 6. Train-Test Split
    X = df[['degree', 'specialization', 'text_features']]
    y = df['target_job_role']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 7. Train
    clf.fit(X_train, y_train)
    
    # 8. Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    # 9. Save Model (Retrain on full data)
    clf.fit(X, y)
    
    model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'job_predictor.pkl')
    
    joblib.dump(clf, model_path)
    
    print(f"Model trained successfully and saved to {model_path}")
    return {
        "status": "success", 
        "message": f"Model trained on {len(df)} records ({len(df_real)} real). Accuracy: {accuracy * 100:.2f}%. Saved to {model_path}",
        "accuracy": accuracy
    }

if __name__ == '__main__':
    train_model()
