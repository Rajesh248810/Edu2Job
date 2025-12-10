from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Adminlogs, Education, Predictionhistory, TrainingData
from .serializers import UserSerializer
from django.db.models import Count
import datetime
from .permissions import IsAdmin
import csv
import os
from django.conf import settings

class AdminUserListView(APIView):
    """
    GET: List all users (with optional search)
    DELETE: Bulk delete users
    """
    permission_classes = [IsAdmin]
    def get(self, request):
        query = request.query_params.get('search', '')
        users = User.objects.all()
        
        if query:
            users = users.filter(name__icontains=query) | users.filter(email__icontains=query)
            
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def delete(self, request):
        user_ids = request.data.get('user_ids', [])
        if not user_ids:
             return Response({'error': 'No users selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Log deletions before deleting
            admin_user = User.objects.get(email=request.user.email)
            users_to_delete = User.objects.filter(user_id__in=user_ids)
            
            for user in users_to_delete:
                try:
                    Adminlogs.objects.create(
                        admin=admin_user,
                        target_user=user,
                        action_type='USER_DELETED_BULK',
                        timestamp=datetime.datetime.now()
                    )
                except Exception as e:
                    print(f"Logging failed for user {user.user_id}: {e}")

            users_to_delete.delete()
            return Response({'message': 'Users deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserDetailView(APIView):
    """
    DELETE: Delete a user
    PATCH: Update user role
    """
    permission_classes = [IsAdmin]
    def delete(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            
            # Log Action
            try:
                admin_user = User.objects.get(email=request.user.email)
                Adminlogs.objects.create(
                    admin=admin_user,
                    target_user=user,
                    action_type='USER_DELETED',
                    timestamp=datetime.datetime.now()
                )
            except Exception as e:
                print(f"Logging failed: {e}")

            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            role = request.data.get('role')
            if role:
                user.role = role
                user.save()
                
                # Log Action
                try:
                    admin_user = User.objects.get(email=request.user.email)
                    Adminlogs.objects.create(
                        admin=admin_user,
                        target_user=user,
                        action_type=f'ROLE_UPDATED_TO_{role.upper()}',
                        timestamp=datetime.datetime.now()
                    )
                except Exception as e:
                    print(f"Logging failed: {e}")

                return Response({'message': 'User role updated successfully'}, status=status.HTTP_200_OK)
            return Response({'error': 'Role not provided'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminLogsView(APIView):
    """
    GET: List system logs
    """
class AdminLogsView(APIView):
    """
    GET: List system logs (with optional search)
    DELETE: Bulk delete logs
    """
    permission_classes = [IsAdmin]
    def get(self, request):
        query = request.query_params.get('search', '')
        logs = Adminlogs.objects.all()
        
        if query:
            # Filter by target user name or admin name or action
            logs = logs.filter(target_user__name__icontains=query) | logs.filter(admin__name__icontains=query) | logs.filter(action_type__icontains=query)
            
        logs = logs.values('log_id', 'action_type', 'timestamp', 'admin__name', 'target_user__name').order_by('-timestamp')
        return Response(list(logs))

    def delete(self, request):
        log_ids = request.data.get('log_ids', [])
        if not log_ids:
             return Response({'error': 'No logs selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            Adminlogs.objects.filter(log_id__in=log_ids).delete()
            return Response({'message': 'Logs deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminAnalyticsView(APIView):
    """
    GET: Global analytics data
    """
    permission_classes = [IsAdmin]
    def get(self, request):
        total_users = User.objects.count()
        students_count = User.objects.filter(role='student').count()
        
        # Real University Distribution with Grouping
        # Fetch all university names
        all_educations = Education.objects.values('university')
        
        categories = {
            'IIT': 0,
            'NIT': 0,
            'IIIT': 0,
            'BITS': 0,
            'Others': 0
        }

        for edu in all_educations:
            uni_name = edu['university'].lower()
            if 'iit' in uni_name or 'indian institute of technology' in uni_name:
                categories['IIT'] += 1
            elif 'nit' in uni_name or 'national institute of technology' in uni_name:
                categories['NIT'] += 1
            elif 'iiit' in uni_name or 'international institute of information technology' in uni_name:
                categories['IIIT'] += 1
            elif 'bits' in uni_name or 'birla institute' in uni_name:
                categories['BITS'] += 1
            else:
                categories['Others'] += 1

        # Filter out zero counts and format for frontend
        university_distribution = [
            {'name': key, 'value': value} 
            for key, value in categories.items() 
            if value > 0
        ]

        # Real Job Trends
        # Aggregate most predicted roles
        job_data = Predictionhistory.objects.values('predicted_roles').annotate(count=Count('predicted_roles')).order_by('-count')[:5]
        job_trends = [{'name': item['predicted_roles'], 'count': item['count']} for item in job_data]

        # Training Data Progress
        total_training_data = TrainingData.objects.count()
        
        # Check for logs first
        last_training_log = Adminlogs.objects.filter(action_type='TRAINING_COMPLETED').order_by('-timestamp').first()
        
        if last_training_log:
            trained_count = TrainingData.objects.filter(created_at__lte=last_training_log.timestamp).count()
        else:
            # Fallback: Check model file modification time
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'job_predictor.pkl')
            if os.path.exists(model_path):
                # Get file modification time
                mod_timestamp = os.path.getmtime(model_path)
                mod_datetime = datetime.datetime.fromtimestamp(mod_timestamp)
                # Make it timezone aware if needed (Django uses timezone aware datetimes)
                # Assuming server time is consistent, or use django.utils.timezone
                # For simplicity, let's just compare naive or handle timezone
                from django.utils import timezone
                if timezone.is_aware(timezone.now()):
                    mod_datetime = timezone.make_aware(mod_datetime)

                trained_count = TrainingData.objects.filter(created_at__lte=mod_datetime).count()
            else:
                trained_count = 0

        # System Health Check
        system_health = 'Good'
        try:
            from django.db import connection
            connection.ensure_connection()
        except Exception:
            system_health = 'Critical'
        
        # Check ML model existence
        model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'job_predictor.pkl')
        if not os.path.exists(model_path):
             if system_health == 'Good': system_health = 'Degraded'

        # Pending Reviews (Incomplete Profiles)
        from django.db.models import Q
        pending_reviews = User.objects.filter(role='student').annotate(
            edu_count=Count('education'), 
            skill_count=Count('skills')
        ).filter(Q(edu_count=0) | Q(skill_count=0)).count()

        data = {
            'total_users': total_users,
            'students_count': students_count,
            'university_distribution': university_distribution,
            'job_trends': job_trends,
            'system_health': system_health,
            'pending_reviews': pending_reviews,
            'training_stats': {
                'total': total_training_data,
                'trained': trained_count
            }
        }
        return Response(data)

class AdminModelView(APIView):
    """
    POST: Upload training data or Retrain model
    """
    permission_classes = [IsAdmin]

    def post(self, request, action):
        if action == 'upload':
            file = request.FILES.get('file')
            if not file:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Save file logic (Keep CSV for bulk upload if needed, or parse and save to DB)
            # For now, let's keep CSV upload as is, or better: Parse CSV and save to TrainingData model
            try:
                decoded_file = file.read().decode('utf-8').splitlines()
                reader = csv.DictReader(decoded_file)
                
                training_objects = []
                for row in reader:
                    training_objects.append(TrainingData(
                        degree=row.get('Degree', ''),
                        specialization=row.get('Specialization', ''),
                        skills=row.get('Skills', ''),
                        certifications=row.get('Certifications', ''),
                        target_job_role=row.get('Job_Role', '')
                    ))
                
                TrainingData.objects.bulk_create(training_objects)
                return Response({'message': f'File {file.name} processed and {len(training_objects)} records added to DB'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': f'Failed to process CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif action == 'data':
            # Single record training
            data = request.data
            required_fields = ['degree', 'specialization', 'skills', 'certifications', 'target_job_role']
            
            if not all(field in data for field in required_fields):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                TrainingData.objects.create(
                    degree=data['degree'],
                    specialization=data['specialization'],
                    skills=data['skills'],
                    certifications=data['certifications'],
                    target_job_role=data['target_job_role']
                )
                return Response({'message': 'Training record added to database successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        elif action == 'retrain':
            try:
                # Trigger ML script logic in background
                import threading
                from ml_service.train import train_model
                from django.utils import timezone
                
                # Get the admin user performing the action
                admin_user = User.objects.get(email=request.user.email) # Assuming request.user is authenticated via JWT
                
                # Log Start
                Adminlogs.objects.create(
                    admin=admin_user,
                    target_user=admin_user, # Self-referencing for system actions
                    action_type='TRAINING_STARTED',
                    timestamp=timezone.now()
                )

                def run_training_background(admin_id):
                    try:
                        print("Starting background training...")
                        result = train_model()
                        print(f"Background training completed: {result}")
                        
                        # Log Success
                        # Re-fetch admin user in thread context if needed, or pass ID
                        admin = User.objects.get(user_id=admin_id)
                        Adminlogs.objects.create(
                            admin=admin,
                            target_user=admin,
                            action_type='TRAINING_COMPLETED',
                            timestamp=timezone.now()
                        )
                        
                    except Exception as e:
                        print(f"Background training failed: {e}")
                        # Log Failure
                        try:
                            admin = User.objects.get(user_id=admin_id)
                            Adminlogs.objects.create(
                                admin=admin,
                                target_user=admin,
                                action_type='TRAINING_FAILED',
                                timestamp=timezone.now()
                            )
                        except:
                            pass

                thread = threading.Thread(target=run_training_background, args=(admin_user.user_id,))
                thread.start()
                
                return Response({
                    'status': 'success', 
                    'message': 'Training started in background. You will receive a notification in System Logs when complete.'
                }, status=status.HTTP_202_ACCEPTED)

            except Exception as e:
                print(f"Retrain Error: {str(e)}")
                return Response({'error': f"Retrain failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminUniversityDetailView(APIView):
    """
    GET: List students for a specific university category
    """
    permission_classes = [IsAdmin]
    def get(self, request, category):
        category = category.lower()
        students = []
        
        # Fetch all education records with user details
        educations = Education.objects.select_related('user').all()
        
        for edu in educations:
            uni_name = edu.university.lower()
            match = False
            
            if category == 'iit' and ('iit' in uni_name or 'indian institute of technology' in uni_name):
                match = True
            elif category == 'nit' and ('nit' in uni_name or 'national institute of technology' in uni_name):
                match = True
            elif category == 'iiit' and ('iiit' in uni_name or 'international institute of information technology' in uni_name):
                match = True
            elif category == 'bits' and ('bits' in uni_name or 'birla institute' in uni_name):
                match = True
            elif category == 'others':
                # Check if it DOESN'T match any of the top categories
                if not any(x in uni_name for x in ['iit', 'indian institute of technology', 'nit', 'national institute of technology', 'iiit', 'international institute of information technology', 'bits', 'birla institute']):
                    match = True
            
            if match:
                students.append({
                    'user_id': edu.user.user_id,
                    'name': edu.user.name,
                    'email': edu.user.email,
                    'university': edu.university,
                    'degree': edu.degree
                })
                
        return Response(students)
