from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, DashboardView, 
    GoogleLoginView, SetPasswordView, UserListView, PublicProfileView, UserProfileUpdateView,
    PredictJobView, PlacedStudentsView, SubscribeView,
    EducationViewSet, CertificationViewSet, SkillViewSet, JobPlacementViewSet,
    AutocompleteView, PredictionHistoryView, FeedbackView
)

from .admin_views import (
    AdminUserListView, AdminUserDetailView, AdminLogsView, AdminAnalyticsView, 
    AdminModelView, AdminUniversityDetailView, AdminPredictionLogListView, AdminPredictionLogDetailView, AdminFeedbackView
)

router = DefaultRouter()
router.register(r'education', EducationViewSet)
router.register(r'certification', CertificationViewSet)
router.register(r'skill', SkillViewSet)
router.register(r'placement', JobPlacementViewSet)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('set-password/', SetPasswordView.as_view(), name='set_password'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
    path('predict/', PredictJobView.as_view(), name='predict_job'),
    path('prediction-history/', PredictionHistoryView.as_view(), name='prediction_history'),
    path('placed-students/', PlacedStudentsView.as_view(), name='placed_students'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:user_id>/', PublicProfileView.as_view(), name='public_profile'),
    path('users/<int:user_id>/update/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    
    # Admin Routes
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/logs/', AdminLogsView.as_view(), name='admin_logs'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('admin/analytics/university/<str:category>/', AdminUniversityDetailView.as_view(), name='admin_university_detail'),
    path('admin/model/<str:action>/', AdminModelView.as_view(), name='admin_model'),
    path('admin/prediction-logs/', AdminPredictionLogListView.as_view(), name='admin_prediction_logs_list'),
    path('admin/prediction-logs/<int:pk>/', AdminPredictionLogDetailView.as_view(), name='admin_prediction_logs_detail'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('suggest/', AutocompleteView.as_view(), name='autocomplete'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('admin/feedback/', AdminFeedbackView.as_view(), name='admin_feedback'),
] + router.urls