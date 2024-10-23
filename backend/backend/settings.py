"""
Django settings for myproject project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
#DEBUG = True

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True


CSRF_TRUSTED_ORIGINS = [
    'https://localhost',
    'https://localhost:4430',
]


ALLOWED_HOSTS = ['*']



# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
	'corsheaders',
	'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4430",
    "https://localhost:4430",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://localhost:4430$",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 heures

# Configuration SSL
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Autoriser les requêtes non-CSRF pour l'API
CSRF_TRUSTED_ORIGINS = [
    'https://localhost:4430',
]


# Mise à jour de l'URL de redirection 42
FORTYTWO_REDIRECT_URI = 'https://localhost:8443/api/callback-42/'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Authentification standard par username
    'accounts.authentication.EmailBackend',       # Authentification par email
]

# Configurer Django REST Framework pour utiliser JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Configuration Simple JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


FORTYTWO_CLIENT_ID='u-s4t2ud-b1a5ece0fe08f8b2d1855de9824f719221dc07ba3f3815b6591ee841972b28b8'
FORTYTWO_CLIENT_SECRET='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'
FORTYTWO_REDIRECT_URI='https://localhost:4430/api/callback-42/'
LOGIN_URL = '/login-register/'  # URL où rediriger si non authentifié
LOGIN_REDIRECT_URL = '/home/'   # URL après connexion réussie


CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'backend.urls'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'frontend', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
				'django.template.context_processors.csrf',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

AUTH_USER_MODEL = 'accounts.CustomUser'



# Database
# Utilisation des variables d'environnement pour configurer la base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': os.environ.get('POSTGRES_HOST'),
        'PORT': os.environ.get('POSTGRES_PORT'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'accounts.validators.ComplexPasswordValidator', 
    }
]

PBKDF2_ITERATIONS = 310000  #nombre d'itérations


TIME_ZONE = 'Europe/Paris'
USE_TZ = False  # Si tu préfères ne pas utiliser les fuseaux horaires dans les données

#TIME_ZONE = 'UTC'
#USE_TZ = True

# Internationalization
LANGUAGE_CODE = 'en-us'


USE_I18N = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Indiquer à Django où chercher les fichiers statiques
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "frontend", "static"),  # Chemin vers frontend/static
]

# Collectstatic root
STATIC_ROOT = os.path.join(BASE_DIR, 'backend', 'staticfiles')  # Le dossier où collectstatic va placer les fichiers

MEDIA_URL = '/media/'  # URL pour accéder aux fichiers médias
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Chemin pour stocker les fichiers uploadés
# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',  # Niveau de log à afficher (DEBUG pour tout voir)
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Niveau de log pour Django
        },
    },
}

