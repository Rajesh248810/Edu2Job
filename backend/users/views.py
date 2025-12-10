from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import User, Education, Certification, Skill, JobPlacement
from .serializers import UserSerializer, EducationSerializer, CertificationSerializer, SkillSerializer, JobPlacementSerializer
import jwt, datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import string
from django.conf import settings
import joblib
import pandas as pd
import os
from ml_service.predict import predict_job

# SECURITY WARNING: Move this to settings.py in production
# SECRET_KEY moved to settings.py

class RegisterView(APIView):
    def post(self, request):
        firstName = request.data.get('firstName')
        lastName = request.data.get('lastName')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([firstName, lastName, email, password]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create(
                name=f"{firstName} {lastName}",
                email=email,
                password_hash=password,
                role='student'
            )
            payload = {
                'user_id': user.user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
                'iat': datetime.datetime.utcnow()
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            serializer = UserSerializer(user)
            return Response({'message': 'Registration Successful', 'token': token, 'user': serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class PublicProfileView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
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
        
        return Response(result, status=status.HTTP_200_OK)

# ViewSets
class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        user = User.objects.get(user_id=user_id)
        serializer.save(user=user)

class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        user = User.objects.get(user_id=user_id)
        serializer.save(user=user)

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(user_id=user_id)
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class JobPlacementViewSet(viewsets.ModelViewSet):
    queryset = JobPlacement.objects.all()
    serializer_class = JobPlacementSerializer
    
    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(user_id=user_id)
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

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