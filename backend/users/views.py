from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from .models import User, Education, Certification, Skill, JobPlacement, Predictionhistory, Feedback, SupportTicket, TicketChat, Notification, ChatReport, Message
from .serializers import UserSerializer, EducationSerializer, CertificationSerializer, SkillSerializer, JobPlacementSerializer, SupportTicketSerializer, TicketChatSerializer, NotificationSerializer, ChatReportSerializer, MessageSerializer
import jwt, datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import string
from django.conf import settings
from django.core.cache import cache

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
                from django.contrib.auth.hashers import make_password
                user = User.objects.create(
                    name=f"{firstName} {lastName}",
                    email=email,
                    password_hash=make_password(password),
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
            
            # PERFORMANCE OPTIMIZATION: Handle non-critical tasks in background thread
            def background_onboarding(user, firstName):
                # Welcome Notification
                try:
                    from .utils import create_notification
                    create_notification(
                        user=user,
                        message=f"Welcome to Edu2Job, {firstName}! We're exploring career paths with you.",
                        type='welcome'
                    )
                except Exception as e:
                    print(f"DEBUG: Notification failed (Non-critical): {e}")
                
                # Send Welcome Email
                try:
                    from .utils import send_welcome_email
                    send_welcome_email(user)
                    print("DEBUG: Email function called in background")
                except Exception as e:
                    print(f"Warning: Welcome email could not be sent (Non-critical): {e}")

            import threading
            threading.Thread(target=background_onboarding, args=(user, firstName)).start()

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

        from django.contrib.auth.hashers import check_password, make_password
        
        # Check password (handles both hashed and plain text via check_password if configured properly, 
        # but we need to handle our legacy plain text manual check too)
        is_correct = False
        
        # 1. Try hashed check (Standard Django)
        if check_password(password, user.password_hash):
            is_correct = True
        # 2. Lazy Migration: Try plain text check for legacy users
        elif user.password_hash == password:
            is_correct = True
            # SECURITY UPGRADE: Hash the password now that they've logged in successfully
            user.password_hash = make_password(password)
            user.save()
            print(f"DEBUG: Migrated legacy password for {email}")

        if not is_correct:
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
        
        from django.contrib.auth.hashers import make_password
        user.password_hash = make_password(new_password)
        user.save()
        return Response({'message': 'Password set successfully'}, status=status.HTTP_200_OK)

class PredictJobView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        
        # Fallback to authenticated user if missing in body
        if not user_id and request.user and request.user.is_authenticated:
            user_id = request.user.user_id
            
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
        try:
            # Automatically attach user from request
            serializer.save(user=self.request.user)
        except Exception as e:
            import traceback
            error_msg = f"ERROR in perform_create ({self.__class__.__name__}): {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            # Log to a file we can read
            with open('debug_api_errors.log', 'a') as f:
                f.write(error_msg + "\n")
            raise e

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

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('other_user_id')
        
        if other_user_id:
            from django.db.models import Q
            return Message.objects.filter(
                Q(sender=user, recipient_id=other_user_id) | 
                Q(sender_id=other_user_id, recipient=user)
            ).order_by('timestamp')
        
        # Determine unique conversations? Or just list all recent messages?
        # For now, return all messages involving this user
        from django.db.models import Q
        return Message.objects.filter(Q(sender=user) | Q(recipient=user)).order_by('-timestamp')

    def perform_create(self, serializer):
        sender = self.request.user
        recipient_id = self.request.data.get('recipient')
        recipient = User.objects.get(user_id=recipient_id)
        
        # Save the message
        message = serializer.save(sender=sender, recipient=recipient)
        
        # Create In-App Notification
        from .utils import create_notification, send_new_message_email
        create_notification(
            user=recipient,
            message=f"New message from {sender.name}: {message.content[:30]}...",
            type='new_message'
        )
        
        # Check for previous interaction to trigger email
        # We check if there are ANY messages between these two BEFORE this new one
        # If count is 1 (the one just created), then it's the first message.
        from django.db.models import Q
        interaction_count = Message.objects.filter(
            Q(sender=sender, recipient=recipient) | 
            Q(sender=recipient, recipient=sender)
        ).count()
        
        # If count is 1, it means this is the very first message between them
        if interaction_count == 1:
            try:
                send_new_message_email(sender, recipient, message.content)
            except Exception as e:
                print(f"Failed to send first message email: {e}")



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
        status_data = {"status": "Starting"}
        try:
            # Import locally to avoid top-level crashes
            from django.core.mail import send_mail
            from django.conf import settings
            import traceback
            import os

            status_data["step"] = "Imports Loaded"
            
            # Get parameters
            recipient = request.GET.get('to', 'sahoogyanaranjan353@gmail.com')
            custom_msg = request.GET.get('msg', 'Hostinger SMTP Test')
            subject = request.GET.get('subject', 'Edu2Job SMTP Test')

            # Debug Info
            debug_info = {
                "MICROSERVICE_URL": getattr(settings, 'EMAIL_MICROSERVICE_URL', 'Not Set'),
                "MICROSERVICE_SECRET_SET": bool(getattr(settings, 'EMAIL_MICROSERVICE_SECRET', None)),
                "DEFAULT_FROM_EMAIL": getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not Set'),
            }
            print(f"DEBUG EMAIL CONFIG: {debug_info}")

            # Use the new utility that routes to Microservice
            from .utils import send_html_email
            
            # Create a simple HTML body for the test
            html_body = f"""
                <h3>Test Email from Edu2Job</h3>
                <p><strong>Message:</strong> {custom_msg}</p>
                <p>This email was sent via the Vercel Microservice to bypass SMTP blocks.</p>
                <hr>
                <p>Config: {debug_info}</p>
            """
            
            # We use send_html_email which handles the threading/microservice logic
            send_html_email(subject, [recipient], html_body)
            
            return Response({
                "status": "Success", 
                "message": f"Email queued for {recipient}. Check inbox (and spam).", 
                "config": debug_info,
                "note": "Sent via Vercel Microservice"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"CRITICAL EMAIL FAILURE: {e}")
            import traceback
            return Response({
                "status": "Failed",
                "error": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc(),
                "last_step": status_data.get("step", "Unknown")
            }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        
        # Cache key: reset_otp:user@example.com
        cache_key = f"reset_otp:{email}"
        
        # Store in cache for 120 seconds (2 minutes)
        cache.set(cache_key, otp, timeout=120)

        # Send Email
        try:
            from .utils import send_otp_email
            send_otp_email(email, otp)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your email. Expires in 2 minutes.'})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"reset_otp:{email}"
        cached_otp = cache.get(cache_key)

        if cached_otp is None:
             return Response({'error': 'OTP has expired or is invalid.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if str(cached_otp) != str(otp):
             return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'OTP verified successfully.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
            return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP again to be sure
        cache_key = f"reset_otp:{email}"
        cached_otp = cache.get(cache_key)

        if cached_otp is None or str(cached_otp) != str(otp):
             return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Update password
            user.password_hash = new_password
            user.save()

            # Clear OTP
            cache.delete(cache_key)

            return Response({'message': 'Password reset successfully. You can now login.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class DebugErrorLogView(APIView):
    # Secured by checking admin role
    def get(self, request):
        if getattr(request.user, 'role', '') != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        log_paths = ['debug_api_errors.log', 'debug_errors.log']
        logs = {}
        for path in log_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    logs[path] = f.read()
            else:
                logs[path] = "File not found."
        return Response(logs)
