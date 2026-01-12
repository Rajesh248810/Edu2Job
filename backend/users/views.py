from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from .models import User, Education, Certification, Skill, JobPlacement, Predictionhistory, Feedback, SupportTicket, TicketChat, Notification, ChatReport
from .serializers import UserSerializer, EducationSerializer, CertificationSerializer, SkillSerializer, JobPlacementSerializer, SupportTicketSerializer, TicketChatSerializer, NotificationSerializer, ChatReportSerializer
import jwt, datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import string
from django.conf import settings
import joblib
import pandas as pd
import os
import json
from ml_service.predict import predict_job


# SECURITY WARNING: Move this to settings.py in production
# SECRET_KEY moved to settings.py

class RegisterView(APIView):
    def post(self, request):
        firstName = request.data.get('firstName')
        lastName = request.data.get('lastName')
        email = request.data.get('email')
        password = request.data.get('password')

        print(f"DEBUG: Register attempt for {email}")

        if not all([firstName, lastName, email, password]):
            print("DEBUG: Missing fields")
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            print("DEBUG: User exists")
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print("DEBUG: Creating User...")
            try:
                user = User.objects.create(
                    name=f"{firstName} {lastName}",
                    email=email,
                    password_hash=password,
                    role='student'
                )
                print(f"DEBUG: User created {user.user_id}")
            except Exception as db_err:
                print(f"CRITICAL: Database User Creation Failed: {db_err}")
                return Response({'error': f'Database error: {str(db_err)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            payload = {
                'user_id': user.user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
                'iat': datetime.datetime.utcnow()
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            # Welcome Notification (Non-blocking)
            try:
                print("DEBUG: Creating Notification...")
                create_notification(
                    user=user,
                    message=f"Welcome to Edu2Job, {firstName}! We're exploring career paths with you.",
                    type='welcome'
                )
            except Exception as e:
                print(f"DEBUG: Notification failed (Non-critical): {e}")
            
            # Send Welcome Email (Non-blocking)
            try:
                print("DEBUG: Sending Email...")
                from .utils import send_welcome_email
                send_welcome_email(user)
                print("DEBUG: Email function called")
            except Exception as e:
                print(f"Warning: Welcome email could not be sent (Non-critical): {e}")

            serializer = UserSerializer(user)
            print("DEBUG: Success Response Ready")
            return Response({'message': 'Registration Successful', 'token': token, 'user': serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"CRITICAL REGISTER ERROR (General): {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.password_hash != password:
            return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)

        payload = {
            'user_id': user.user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        serializer = UserSerializer(user)
        return Response({'message': 'Login Successful', 'token': token, 'user': serializer.data}, status=status.HTTP_200_OK)

class DashboardView(APIView):
    def get(self, request):
        user_id = request.GET.get('user_id')
        if not user_id:
             return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(user_id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all().prefetch_related(
            'education_set',
            'certification_set',
            'skills',
            'placements',
            'predictionhistory_set'
        )
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class PublicProfileView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.prefetch_related(
                'education_set',
                'certification_set',
                'skills',
                'placements',
                'predictionhistory_set'
            ).get(user_id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=10)
            email = id_info['email']
            name = id_info.get('name', '')
            
            try:
                user = User.objects.get(email=email)
                # Existing User - Login
                payload = {'user_id': user.user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1), 'iat': datetime.datetime.utcnow()}
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                serializer = UserSerializer(user)
                return Response({'message': 'Google Login Successful', 'token': token, 'user': serializer.data, 'is_new_user': False}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                # New User - Return details for registration
                return Response({
                    'message': 'New Google User', 
                    'is_new_user': True, 
                    'email': email, 
                    'name': name
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SetPasswordView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION') or request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Unauthorized: Missing Bearer token'}, status=status.HTTP_401_UNAUTHORIZED)
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(user_id=payload['user_id'])
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        new_password = request.data.get('password')
        if not new_password:
             return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.password_hash = new_password
        user.save()
        return Response({'message': 'Password set successfully'}, status=status.HTTP_200_OK)

class PredictJobView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare User Profile Data
        skills = [s.skill_name for s in user.skills.all()]
        certifications = [c.cert_name for c in user.certification_set.all()]
        education = user.education_set.first()
        
        if not education:
                return Response({'error': 'Education details are required for prediction'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_profile = {
            'degree': education.degree,
            'specialization': education.specialization,
            'skills': ", ".join(skills),
            'certifications': ", ".join(certifications)
        }

        # Call the shared prediction function
        result = predict_job(user_profile)

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Save Prediction History
        try:
            top_role = result['predictions'][0]['role']
            new_confidence_scores = json.dumps(result['predictions'])
            
            # OPTIMIZATION: Check if the latest prediction for this user is exactly the same role
            last_prediction = Predictionhistory.objects.filter(user=user).order_by('-timestamp').first()
            
            if last_prediction and last_prediction.predicted_roles == top_role:
                 # Update existing record instead of creating new one
                 last_prediction.confidence_scores = new_confidence_scores
                 last_prediction.timestamp = datetime.datetime.now() # Update time to now
                 last_prediction.save()
                 prediction_entry = last_prediction
                 print(f"Updated existing prediction {prediction_entry.prediction_id} for user {user.user_id}")
            else:
                # Create NEW record
                prediction_entry = Predictionhistory.objects.create(
                    user=user,
                    predicted_roles=top_role, 
                    confidence_scores=new_confidence_scores
                )
                print(f"Created NEW prediction {prediction_entry.prediction_id} for user {user.user_id}")
            
            # Inject prediction_id into the response
            result['prediction_id'] = prediction_entry.prediction_id
            
            # Send Prediction Email
            try:
                from .utils import send_prediction_email
                send_prediction_email(user, result)
            except Exception as e:
                print(f"Error sending email: {e}")

        except Exception as e:
            print(f"Error saving history: {e}")
            # Don't fail the request if history save fails

        return Response(result, status=status.HTTP_200_OK)

from rest_framework import status, viewsets, permissions

# ... (existing imports)

# ViewSets
class BaseUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin can see all, regular user only their own
        if getattr(self.request.user, 'role', '') == 'admin':
            return self.queryset.all()
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach user from request
        serializer.save(user=self.request.user)

class EducationViewSet(BaseUserViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

class CertificationViewSet(BaseUserViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer

class SkillViewSet(BaseUserViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    
    # Override create to cleanup old manual user_id extraction
    def create(self, request, *args, **kwargs):
        # We can use standard create now that perform_create handles user
        return super().create(request, *args, **kwargs)

class JobPlacementViewSet(BaseUserViewSet):
    queryset = JobPlacement.objects.all()
    serializer_class = JobPlacementSerializer
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PlacedStudentsView(APIView):
    def get(self, request):
        role = request.GET.get('role')
        if not role:
            return Response({'error': 'Role parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        placements = JobPlacement.objects.filter(role__icontains=role)
        data = []
        for p in placements:
            data.append({
                'name': p.user.name,
                'email': p.user.email,
                'company': p.company,
                'role': p.role,
                'type': p.placement_type,
                'date': p.date_of_joining,
                'user_id': p.user.user_id,
                'profile_picture': p.user.profile_picture.url if p.user.profile_picture else None
            })
        return Response(data, status=status.HTTP_200_OK)

class SubscribeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Simple email validation
        if '@' not in email or '.' not in email:
             return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import NewsletterSubscriber
        if NewsletterSubscriber.objects.filter(email=email).exists():
            return Response({'message': 'Already subscribed!'}, status=status.HTTP_200_OK)

        try:
            NewsletterSubscriber.objects.create(email=email)
            return Response({'message': 'Successfully subscribed!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileUpdateView(APIView):
    def patch(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .gemini_service import get_gemini_suggestions

class AutocompleteView(APIView):
    def get(self, request):
        query = request.GET.get('search')
        suggestion_type = request.GET.get('type')
        
        if not suggestion_type:
             return Response({'error': 'Missing type parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not query:
             # Return "popular" or random 10 items if no query
             limit = 10
             try:
                db_suggestions = []
                if suggestion_type == 'degree':
                    db_suggestions = list(Education.objects.values_list('degree', flat=True).distinct()[:limit])
                elif suggestion_type == 'specialization':
                    db_suggestions = list(Education.objects.values_list('specialization', flat=True).distinct()[:limit])
                elif suggestion_type == 'university':
                    db_suggestions = list(Education.objects.values_list('university', flat=True).distinct()[:limit])
                elif suggestion_type == 'skill':
                    db_suggestions = list(Skill.objects.values_list('skill_name', flat=True).distinct()[:limit])
                elif suggestion_type == 'certification':
                    db_suggestions = list(Certification.objects.values_list('cert_name', flat=True).distinct()[:limit])
                elif suggestion_type == 'company':
                    db_suggestions = list(JobPlacement.objects.values_list('company', flat=True).distinct()[:limit])
                elif suggestion_type == 'role':
                    db_suggestions = list(JobPlacement.objects.values_list('role', flat=True).distinct()[:limit])
                
                return Response(db_suggestions, status=status.HTTP_200_OK)
             except Exception as e:
                print(f"Popular Search Error: {e}")
                return Response([], status=status.HTTP_200_OK)
        
        # 1. DB Search
        db_suggestions = []
        limit = 5
        
        try:
            if suggestion_type == 'degree':
                db_suggestions = list(Education.objects.filter(degree__icontains=query).values_list('degree', flat=True).distinct()[:limit])
            elif suggestion_type == 'specialization':
                db_suggestions = list(Education.objects.filter(specialization__icontains=query).values_list('specialization', flat=True).distinct()[:limit])
            elif suggestion_type == 'university':
                db_suggestions = list(Education.objects.filter(university__icontains=query).values_list('university', flat=True).distinct()[:limit])
            elif suggestion_type == 'skill':
                db_suggestions = list(Skill.objects.filter(skill_name__icontains=query).values_list('skill_name', flat=True).distinct()[:limit])
            elif suggestion_type == 'certification':
                db_suggestions = list(Certification.objects.filter(cert_name__icontains=query).values_list('cert_name', flat=True).distinct()[:limit])
            elif suggestion_type == 'company':
                # localized search in JobPlacement only for now to keep it simple, or combine
                db_suggestions = list(JobPlacement.objects.filter(company__icontains=query).values_list('company', flat=True).distinct()[:limit])
            elif suggestion_type == 'role':
                db_suggestions = list(JobPlacement.objects.filter(role__icontains=query).values_list('role', flat=True).distinct()[:limit])
        except Exception as e:
            print(f"DB Search Error: {e}")
            # Fallback to empty list -> API will take over
            db_suggestions = []

        if len(db_suggestions) > 0:
            return Response(db_suggestions, status=status.HTTP_200_OK)

        return Response([], status=status.HTTP_200_OK)

class PredictionHistoryView(APIView):
    def get(self, request):
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            history = Predictionhistory.objects.filter(user_id=user_id).order_by('-timestamp')
            data = []
            for h in history:
                try:
                    # Parse the stored JSON
                    details = json.loads(h.confidence_scores)
                    # If it's a list (new format), take top item. If old format? 
                    # We just implemented new format.
                    top_prediction = details[0] if isinstance(details, list) and len(details) > 0 else {}
                    
                    data.append({
                        'id': h.prediction_id,
                        'role': top_prediction.get('role', 'Unknown'),
                        'confidence': top_prediction.get('confidence', 0),
                        'date': h.timestamp,
                        'details': details,
                        'is_flagged': h.is_flagged,
                        'corrected_role': h.corrected_role,
                        'admin_notes': h.admin_notes
                    })
                except:
                    continue
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class FeedbackView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        prediction_id = request.data.get('prediction_id')
        rating = request.data.get('rating')
        comments = request.data.get('comments', '')

        if not all([user_id, prediction_id, rating]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            Feedback.objects.create(
                user_id=user_id,
                prediction_id=prediction_id,
                rating=rating,
                comments=comments
            )
            return Response({'message': 'Feedback submitted successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return SupportTicket.objects.all().order_by('-created_at')
        return SupportTicket.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        # Admin can create tickets on behalf of users (Outbound Support)
        if user.role == 'admin':
            target_user_id = self.request.data.get('target_user_id')
            if target_user_id:
                try:
                    target_user = User.objects.get(user_id=target_user_id)
                    serializer.save(user=target_user)
                    
                    # Notify User about the new ticket from Support
                    create_notification(
                        user=target_user,
                        message=f"Support Team created a new ticket: {serializer.validated_data.get('subject')}",
                        type='ticket_create'
                    )
                    return
                except User.DoesNotExist:
                     pass # Fallback to creating for admin (or error)
        
        serializer.save(user=user)

class TicketChatViewSet(viewsets.ModelViewSet):
    queryset = TicketChat.objects.all()
    serializer_class = TicketChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by ticket ID if provided in query params
        ticket_id = self.request.query_params.get('ticket_id')
        if ticket_id:
            # Check if user has access to this ticket
            try:
                ticket = SupportTicket.objects.get(ticket_id=ticket_id)
                if self.request.user.role == 'admin' or ticket.user == self.request.user:
                    return TicketChat.objects.filter(ticket_id=ticket_id).order_by('timestamp')
            except SupportTicket.DoesNotExist:
                return TicketChat.objects.none()
        return TicketChat.objects.none() # Don't return all chats by default

    def perform_create(self, serializer):
        ticket_id = self.request.data.get('ticket')
        ticket = SupportTicket.objects.get(ticket_id=ticket_id)
        
        # Verify permission
        if self.request.user.role != 'admin' and ticket.user != self.request.user:
             raise permissions.PermissionDenied("You do not have permission to chat on this ticket.")

        serializer.save(sender=self.request.user, ticket=ticket)

        # Notify the other party
        is_admin = self.request.user.role == 'admin'
        recipient = ticket.user if is_admin else None # If logic for admin notifications is needed, it's more complex (which admin?)
        
        if recipient and is_admin:
            # Notify User (System)
            create_notification(
                user=recipient,
                message=f"Support Agent replied to your ticket: {ticket.subject}",
                type='ticket_reply'
            )
            
            # Send Email
            try:
                from .utils import send_ticket_reply_email
                send_ticket_reply_email(recipient, ticket.subject, serializer.instance.message)
            except Exception as e:
                print(f"Error sending reply email: {e}")

        elif not is_admin:
             # Notify Admin (Just conceptually, or if we had a specific admin assigned)
             pass

    def perform_destroy(self, instance):
        if self.request.user.role == 'admin' or instance.sender == self.request.user:
            instance.delete()
        else:
             raise permissions.PermissionDenied("You can only delete your own messages.")

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_update(self, serializer):
        # Allow marking as read
        serializer.save()

class ChatReportViewSet(viewsets.ModelViewSet):
    queryset = ChatReport.objects.all()
    serializer_class = ChatReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

class DebugStatusView(APIView):
    permission_classes = [permissions.AllowAny] # Public access for debugging
    def get(self, request):
        base_dir = settings.BASE_DIR
        model_path = os.path.join(base_dir, 'ml_models', 'job_predictor.pkl')
        
        status_info = {
            "base_dir": str(base_dir),
            "cwd": os.getcwd(),
            "model_path": model_path,
            "model_exists": os.path.exists(model_path),
            "dir_contents": [],
            "ml_models_contents": [],
            "model_load_status": "Not attempted"
        }
        
        try:
            status_info["dir_contents"] = os.listdir(base_dir)
        except Exception as e:
            status_info["dir_contents"] = f"Error: {str(e)}"
        
        try:
            ml_models_dir = os.path.join(base_dir, 'ml_models')
            if os.path.exists(ml_models_dir):
                status_info["ml_models_contents"] = os.listdir(ml_models_dir)
            else:
                status_info["ml_models_contents"] = "Directory not found"
        except Exception as e:
            status_info["ml_models_contents"] = f"Error: {str(e)}"
            
        try:
            if os.path.exists(model_path):
                clf = joblib.load(model_path)
                status_info["model_load_status"] = "Success"
                status_info["classes"] = list(clf.classes_)
            else:
                status_info["model_load_status"] = "File missing"
        except Exception as e:
             status_info["model_load_status"] = f"Failed: {str(e)}"
             
        return Response(status_info, status=status.HTTP_200_OK)

class TestEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        from django.core.mail import send_mail
        from django.conf import settings
        import os
        
        email_host = settings.EMAIL_HOST
        email_port = settings.EMAIL_PORT
        email_user = settings.EMAIL_HOST_USER
        email_use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)
        email_use_tls = getattr(settings, 'EMAIL_USE_TLS', False)
        default_from = settings.DEFAULT_FROM_EMAIL

        # Mask sensitive info
        masked_user = email_user[:3] + "***" if email_user else "None"
        
        debug_info = {
            "EMAIL_HOST": email_host,
            "EMAIL_PORT": email_port,
            "EMAIL_HOST_USER": masked_user,
            "EMAIL_USE_SSL": email_use_ssl,
            "EMAIL_USE_TLS": email_use_tls,
            "DEFAULT_FROM_EMAIL": default_from,
            "Status": "Attempting to send..."
        }

        try:
            send_mail(
                subject="Edu2Job Live Debug Email",
                message="If you receive this, Django email settings are correct!",
                from_email=default_from or email_user,
                recipient_list=['sahoogyanaranjan353@gmail.com'], # Hardcoded user email for test
                fail_silently=False
            )
            debug_info["Status"] = "Success! Email sent."
            return Response(debug_info, status=status.HTTP_200_OK)
        except Exception as e:
            debug_info["Status"] = f"Failed: {str(e)}"
            return Response(debug_info, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
