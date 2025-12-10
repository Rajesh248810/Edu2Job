import os
import django
import sys
import datetime

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Adminlogs, Education, Predictionhistory, TrainingData, Skill
from django.db.models import Count, Q
from django.conf import settings
from django.utils import timezone

def debug_analytics():
    print("Starting debug_analytics...")
    try:
        total_users = User.objects.count()
        print(f"Total Users: {total_users}")
        
        students_count = User.objects.filter(role='student').count()
        print(f"Students Count: {students_count}")
        
        # Real University Distribution
        all_educations = Education.objects.values('university')
        print(f"Educations fetched: {len(all_educations)}")
        
        # Real Job Trends
        job_data = Predictionhistory.objects.values('predicted_roles').annotate(count=Count('predicted_roles')).order_by('-count')[:5]
        print(f"Job Trends fetched: {len(job_data)}")

        # Training Data Progress
        total_training_data = TrainingData.objects.count()
        print(f"Total Training Data: {total_training_data}")
        
        last_training_log = Adminlogs.objects.filter(action_type='TRAINING_COMPLETED').order_by('-timestamp').first()
        print(f"Last Training Log: {last_training_log}")
        
        if last_training_log:
            trained_count = TrainingData.objects.filter(created_at__lte=last_training_log.timestamp).count()
        else:
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'job_predictor.pkl')
            if os.path.exists(model_path):
                mod_timestamp = os.path.getmtime(model_path)
                mod_datetime = datetime.datetime.fromtimestamp(mod_timestamp)
                if timezone.is_aware(timezone.now()):
                    mod_datetime = timezone.make_aware(mod_datetime)
                trained_count = TrainingData.objects.filter(created_at__lte=mod_datetime).count()
            else:
                trained_count = 0
        print(f"Trained Count: {trained_count}")

        # System Health Check
        system_health = 'Good'
        try:
            from django.db import connection
            connection.ensure_connection()
        except Exception:
            system_health = 'Critical'
        print(f"System Health: {system_health}")

        # Pending Reviews
        print("Calculating Pending Reviews...")
        pending_reviews = User.objects.filter(role='student').annotate(
            edu_count=Count('education'), 
            skill_count=Count('skills')
        ).filter(Q(edu_count=0) | Q(skill_count=0)).count()
        print(f"Pending Reviews: {pending_reviews}")

        print("Debug completed successfully.")

    except Exception as e:
        print(f"CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_analytics()
