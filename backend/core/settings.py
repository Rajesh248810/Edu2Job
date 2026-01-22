"""
Django settings for core project.
"""

import os
import dj_database_url
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, '.env'))

# SECURITY: In production, do not keep this hardcoded!
# SECURITY: In production, do not keep this hardcoded!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-this-in-production')
GOOGLE_CLIENT_ID = '463529438142-dpm6nrfs3ep90vnaigvev5cglnfpevtu.apps.googleusercontent.com'

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Allow all hosts for dev tunnels
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',') + ['.edu2job.online', 'edu2job.online']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',

    # My Apps
    'users',
    'ml_service',
    'blog',
    # 'anymail',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.COOPMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'EDU2JOB',
        'USER': 'root',
        'PASSWORD': 'rAJESHP4558@x',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

database_url = os.getenv('DATABASE_URL')
if database_url:
    DATABASES['default'] = dj_database_url.config(default=database_url, conn_max_age=600)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Media Files (Uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security: Detect HTTPS behind proxy (Render/Vercel)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# --- API & REACT CONFIGURATION ---

# 1. CORS: Allow React (Port 5173) to talk to Django
CORS_ALLOW_ALL_ORIGINS = False  # Explicit allows only
CORS_ALLOW_CREDENTIALS = True
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'content-type',
    'authorization',
]

CORS_ALLOWED_ORIGINS = [
    'https://edu2job.online',
    'https://www.edu2job.online',
    'https://edu2-job.vercel.app',
    'http://localhost:5173',
]

# 2. CSRF: Trusted Origins for Dev Tunnels
CSRF_TRUSTED_ORIGINS = [
    'https://edu2job.online',
    'https://www.edu2job.online',
    'https://edu2-job.vercel.app',
    'http://localhost:5173',
]
# Add dynamic devtunnels if needed manually, or keep explicit list for prod stability

# 3. DRF: Use JWT Tokens instead of Sessions
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.CustomJWTAuthentication',
    )
}

# --- EMAIL CONFIGURATION (HOSTINGER SMTP) ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.hostinger.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

# Auto-configure security based on port
if EMAIL_PORT == 465:
    EMAIL_USE_SSL = True
    EMAIL_USE_TLS = False
else:
    EMAIL_USE_SSL = False
    EMAIL_USE_TLS = True

# --- EMAIL MICROSERVICE CONFIGURATION ---
EMAIL_MICROSERVICE_URL = os.getenv('EMAIL_MICROSERVICE_URL', 'https://edu2-job-email.vercel.app')
EMAIL_MICROSERVICE_SECRET = os.getenv('EMAIL_MICROSERVICE_SECRET', 'default-dev-secret')

# Keep these for reference or fallback, but actual sending will route via HTTP
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'support@edu2job.online')
# EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
# ANYMAIL = {
#     "BREVO_API_KEY": os.getenv("BREVO_API_KEY"),
# } 

 
