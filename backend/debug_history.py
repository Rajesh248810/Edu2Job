import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Predictionhistory

def test_history():
    print("--- Starting History Debug ---")
    
    # 1. Get a test user
    user = User.objects.first()
    if not user:
        print("ERROR: No users found in DB to test with.")
        return
    print(f"Testing with User: {user.name} (ID: {user.user_id})")

    # 2. Check existing history
    count_before = Predictionhistory.objects.filter(user=user).count()
    print(f"History count before: {count_before}")

    # 3. Create a dummy prediction
    print("Attempting to create a test prediction history record...")
    try:
        dummy_predictions = [
            {"role": "Test Role", "confidence": 99.9, "missing_skills": ["None"]}
        ]
        ph = Predictionhistory.objects.create(
            user=user,
            predicted_roles="Test Role",
            confidence_scores=json.dumps(dummy_predictions)
        )
        print(f"Created record ID: {ph.prediction_id}")
    except Exception as e:
        print(f"FAILED to update DB: {e}")
        return

    # 4. Verify it exists
    count_after = Predictionhistory.objects.filter(user=user).count()
    print(f"History count after: {count_after}")
    
    if count_after > count_before:
        print("SUCCESS: Record persisted to DB.")
    else:
        print("FAILURE: Record not found in DB after create.")

    # 5. Test retrieval parsing
    try:
        latest = Predictionhistory.objects.filter(user=user).last()
        print(f"Retrieved Latest: ID {latest.prediction_id}")
        data = json.loads(latest.confidence_scores)
        print(f"Parsed JSON: {data}")
        print("SUCCESS: Retrieval and JSON parsing works.")
    except Exception as e:
        print(f"FAILED to parse retrieved data: {e}")

if __name__ == "__main__":
    test_history()
