"""
AdoraTrip — Development Settings

Two modes:
  1. Docker  — DATABASE_URL is set in the environment (PostgreSQL via compose)
  2. Local   — DATABASE_URL not set; falls back to SQLite for quick iteration
"""
from .base import *
import dj_database_url
from decouple import config

DEBUG = True

# ---------------------------------------------------------------------------
# Database
# Docker sets DATABASE_URL → PostgreSQL (matches the db: service in compose).
# Without Docker, SQLite is used so you can run manage.py without any infra.
# ---------------------------------------------------------------------------
_database_url = config('DATABASE_URL', default='')

if _database_url:
    # Running inside Docker — use the PostgreSQL container
    DATABASES = {
        'default': dj_database_url.config(
            default=_database_url,
            conn_max_age=60,        # Short-lived connections in dev (restart-friendly)
            conn_health_checks=True,
        )
    }
else:
    # Running locally without Docker — SQLite for zero-setup dev
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ---------------------------------------------------------------------------
# Email — print to console (no real SMTP needed in dev)
# ---------------------------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Skip email verification so you can log in immediately in dev
ACCOUNT_EMAIL_VERIFICATION = 'none'

# ---------------------------------------------------------------------------
# Security — relaxed for local development
# ---------------------------------------------------------------------------
JWT_REFRESH_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# ---------------------------------------------------------------------------
# Caching
# Docker: use Redis (set in REDIS_URL env var, matches redis: service).
# Local:  use in-memory cache so you don't need Redis installed.
# ---------------------------------------------------------------------------
_redis_url = config('REDIS_URL', default='')

if _redis_url:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': _redis_url,
            'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'KEY_PREFIX': 'adoratrip_dev',
        },
        'axes': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': _redis_url.rstrip('/0') + '/1',
            'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'KEY_PREFIX': 'axes_dev',
        },
    }
    # Use Redis-backed axes handler when Redis is available
    AXES_HANDLER = 'axes.handlers.cache.AxesCacheHandler'
    AXES_CACHE = 'axes'
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
    # Fall back to DB-backed handler when Redis isn't running
    AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'

# ---------------------------------------------------------------------------
# Celery
# Docker: real workers are running — let tasks go async.
# Local:  run tasks synchronously (no broker/worker needed).
# ---------------------------------------------------------------------------
if not _redis_url:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = False   # Swallow errors so they don't crash the view

# ---------------------------------------------------------------------------
# Django Debug Toolbar (optional — installed only if present in venv)
# ---------------------------------------------------------------------------
try:
    import debug_toolbar  # noqa: F401
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1']
except ImportError:
    pass
