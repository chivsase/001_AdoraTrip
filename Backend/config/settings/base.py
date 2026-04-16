"""
AdoraTrip — Base Settings
Shared across all environments.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-in-production')

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ----------------------------------------------------------
# Custom User Model
# ----------------------------------------------------------
AUTH_USER_MODEL = 'users.CustomUser'

# ----------------------------------------------------------
# Installed Apps
# ----------------------------------------------------------
INSTALLED_APPS = [
    # Django core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',          # required by allauth

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',   # JWT refresh token blacklisting
    'corsheaders',
    'django_filters',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'axes',                           # brute-force protection
    'django_celery_beat',
    'django_celery_results',
    'drf_spectacular',

    # Internal apps
    'users',
    'organizations',
    'api',
]

SITE_ID = 1

# ----------------------------------------------------------
# Middleware (order is critical)
# ----------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',              # before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',       # after AuthenticationMiddleware
    'axes.middleware.AxesMiddleware',                     # after AuthenticationMiddleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middleware.OrgContextMiddleware',              # attach org to request
    'users.middleware.AuditLogMiddleware',                # async audit logging
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# ----------------------------------------------------------
# Authentication Backends (order matters for axes)
# ----------------------------------------------------------
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',                # MUST be first
    'allauth.account.auth_backends.AuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ----------------------------------------------------------
# Password Validation
# ----------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ----------------------------------------------------------
# Internationalization
# ----------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Phnom_Penh'
USE_I18N = True
USE_TZ = True

# ----------------------------------------------------------
# Static & Media
# ----------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'mediafiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------------------------------------------------
# Django REST Framework
# ----------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.authentication.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon':           '60/min',
        'user':           '300/min',
        'auth_login':     '10/min',
        'auth_register':  '5/min',
        'password_reset': '3/min',
        'token_refresh':  '30/min',
        'resend_verify':  '1/5min',
    },
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ----------------------------------------------------------
# Simple JWT
# ----------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':           timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME':          timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':           True,
    'BLACKLIST_AFTER_ROTATION':        True,
    'UPDATE_LAST_LOGIN':               True,
    'ALGORITHM':                       'HS256',
    'SIGNING_KEY':                     config('JWT_SIGNING_KEY', default=SECRET_KEY),
    'AUTH_HEADER_TYPES':               ('Bearer',),
    'AUTH_HEADER_NAME':                'HTTP_AUTHORIZATION',
    'USER_ID_FIELD':                   'id',
    'USER_ID_CLAIM':                   'sub',          # standard JWT claim
    'TOKEN_TYPE_CLAIM':                'token_type',
    'JTI_CLAIM':                       'jti',
    'TOKEN_OBTAIN_SERIALIZER':         'users.serializers.CustomTokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER':        'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
}

# Cookie name used for HttpOnly refresh token
JWT_REFRESH_COOKIE_NAME = 'adoratrip_refresh'
JWT_REFRESH_COOKIE_SAMESITE = 'Lax'
JWT_REFRESH_COOKIE_HTTPONLY = True
JWT_REFRESH_COOKIE_SECURE = config('JWT_REFRESH_COOKIE_SECURE', default=False, cast=bool)

# ----------------------------------------------------------
# django-allauth
# ----------------------------------------------------------
ACCOUNT_ADAPTER               = 'users.adapters.CustomAccountAdapter'
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED        = True
ACCOUNT_USERNAME_REQUIRED     = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = None         # CustomUser has no username field
ACCOUNT_EMAIL_VERIFICATION    = 'mandatory'     # overridden in development.py → 'none'
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_UNIQUE_EMAIL          = True
ACCOUNT_SESSION_REMEMBER      = True
ACCOUNT_PASSWORD_MIN_LENGTH   = 8

SOCIALACCOUNT_ADAPTER         = 'users.adapters.CustomSocialAccountAdapter'
SOCIALACCOUNT_AUTO_SIGNUP     = True
SOCIALACCOUNT_LOGIN_ON_GET    = True             # skip intermediate "Continue?" page
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'       # trust Google/Facebook emails as verified
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID', default=''),
            'secret':    config('GOOGLE_CLIENT_SECRET', default=''),
        },
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'FIELDS': ['id', 'email', 'name', 'picture'],
        'VERIFIED_EMAIL': False,
        'APP': {
            'client_id': config('FACEBOOK_APP_ID', default=''),
            'secret':    config('FACEBOOK_APP_SECRET', default=''),
        },
    },
}

# ----------------------------------------------------------
# django-axes (Brute Force Protection)
# ----------------------------------------------------------
AXES_FAILURE_LIMIT            = 5
AXES_COOLOFF_TIME             = timedelta(hours=1)
AXES_LOCK_OUT_AT_FAILURE      = True
AXES_LOCKOUT_PARAMETERS       = [['ip_address', 'username']]
AXES_RESET_ON_SUCCESS         = True
AXES_VERBOSE                  = False
AXES_HANDLER                  = 'axes.handlers.cache.AxesCacheHandler'
AXES_CACHE                    = 'axes'           # separate Redis DB index

# ----------------------------------------------------------
# CORS
# ----------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True                   # required for HttpOnly refresh cookie
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization',
    'content-type', 'dnt', 'origin', 'user-agent',
    'x-csrftoken', 'x-requested-with', 'x-organization-id',
]

# ----------------------------------------------------------
# CSRF
# ----------------------------------------------------------
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
CSRF_COOKIE_HTTPONLY = False    # Next.js SPA must read the cookie value for X-CSRFToken header
CSRF_COOKIE_SAMESITE = 'Lax'

# ----------------------------------------------------------
# Celery
# ----------------------------------------------------------
CELERY_BROKER_URL              = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND          = 'django-db'
CELERY_CACHE_BACKEND           = 'django-cache'
CELERY_ACCEPT_CONTENT          = ['json']
CELERY_TASK_SERIALIZER         = 'json'
CELERY_RESULT_SERIALIZER       = 'json'
CELERY_TIMEZONE                = TIME_ZONE
CELERY_BEAT_SCHEDULER          = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_TASK_ROUTES = {
    'users.tasks.*':          {'queue': 'emails'},
    'organizations.tasks.*':  {'queue': 'emails'},
}

# ----------------------------------------------------------
# Email (base — overridden per environment)
# ----------------------------------------------------------
DEFAULT_FROM_EMAIL    = config('DEFAULT_FROM_EMAIL', default='AdoraTrip <noreply@adoratrip.com>')
EMAIL_SUBJECT_PREFIX  = '[AdoraTrip] '
SERVER_EMAIL          = DEFAULT_FROM_EMAIL

# ----------------------------------------------------------
# Frontend URL (used in email links)
# ----------------------------------------------------------
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# After social OAuth login, allauth redirects here → our view issues JWTs and
# sends the user to the frontend.
LOGIN_REDIRECT_URL = '/api/v1/auth/oauth/callback/'
ACCOUNT_LOGOUT_REDIRECT_URL = '/api/v1/auth/oauth/callback/'

# ----------------------------------------------------------
# DRF Spectacular (API Docs)
# ----------------------------------------------------------
SPECTACULAR_SETTINGS = {
    'TITLE': 'AdoraTrip API',
    'DESCRIPTION': 'Cambodia Travel Super App — REST API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ----------------------------------------------------------
# Logging — structured file output (like Laravel's storage/logs/)
# Logs are written to Backend/logs/ (volume-mounted in Docker).
# ----------------------------------------------------------
LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        # Detailed formatter for file output — timestamp, level, logger, message
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {module}.{funcName}:{lineno} — {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        # Compact formatter for console
        'simple': {
            'format': '{levelname} {name} — {message}',
            'style': '{',
        },
    },

    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },

    'handlers': {
        # Console — same as Django default, always active
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },

        # All logs — daily rotating file (like Laravel's laravel-YYYY-MM-DD.log)
        'file': {
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': LOG_DIR / 'adoratrip.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 30,          # Keep 30 days of logs
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },

        # Errors only — separate file for quick triage
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': LOG_DIR / 'error.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 90,          # Keep 90 days of error logs
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },

        # SQL queries — only in debug mode, separate file to avoid noise
        'sql_file': {
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': LOG_DIR / 'sql.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 7,
            'formatter': 'verbose',
            'encoding': 'utf-8',
            'filters': ['require_debug_true'],
        },
    },

    'loggers': {
        # Root Django logger
        'django': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },

        # Django request errors (4xx/5xx)
        'django.request': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },

        # Database queries (DEBUG only)
        'django.db.backends': {
            'handlers': ['sql_file'],
            'level': 'DEBUG',
            'propagate': False,
        },

        # Security-related logs (CSRF, auth failures)
        'django.security': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },

        # App loggers — use logging.getLogger('users') etc. in your code
        'users': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'organizations': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },

        # Celery task logs
        'celery': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },

    # Catch-all root logger
    'root': {
        'handlers': ['console', 'file', 'error_file'],
        'level': 'INFO',
    },
}
