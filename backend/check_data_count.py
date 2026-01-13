import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import TrainingData, JobPlacement, Predictionhistory

print(f"TrainingData count: {TrainingData.objects.count()}")
print(f"JobPlacement count: {JobPlacement.objects.count()}")
print(f"Predictionhistory count: {Predictionhistory.objects.count()}")
