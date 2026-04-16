"""
AdoraTrip — Production Settings
"""
from .base import *
import dj_database_url
from decouple import config

DEBUG = False

# ----------------------------------------------------------
# Database (PostgreSQL via DATABASE_URL)
# ----------------------------------------------------------
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ----------------------------------------------------------
# Redis Cache (default + axes on DB index 1)
# ----------------------------------------------------------
REDIS_URL = config('REDIS_URL', default='redis://redis:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
        },
        'KEY_PREFIX': 'adoratrip',
    },
    'axes': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL.rstrip('/0') + '/1',   # DB index 1 for axes
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'axes',
    },
}

# ----------------------------------------------------------
# Security Headers
# ----------------------------------------------------------
SECURE_BROWSER_XSS_FILTER      = True
SECURE_CONTENT_TYPE_NOSNIFF    = True
SECURE_HSTS_SECONDS            = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD            = True
SECURE_SSL_REDIRECT            = True
SECURE_PROXY_SSL_HEADER        = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE          = True
CSRF_COOKIE_SECURE             = True
JWT_REFRESH_COOKIE_SECURE      = True

# ----------------------------------------------------------
# Email — SendGrid via SMTP relay
# Uses Django's built-in SMTP backend (no extra packages required).
# SendGrid SMTP credentials: host=smtp.sendgrid.net, user='apikey',
# password=<SENDGRID_API_KEY from .env>
# ----------------------------------------------------------
EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST          = 'smtp.sendgrid.net'
EMAIL_PORT          = 587
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = 'apikey'
EMAIL_HOST_PASSWORD = config('SENDGRID_API_KEY')

# ----------------------------------------------------------
# Sentry
# ----------------------------------------------------------
import sentry_sdk
sentry_sdk.init(
    dsn=config('SENTRY_DSN', default=''),
    traces_sample_rate=0.1,
    environment='production',
)
