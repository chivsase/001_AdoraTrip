"""
AdoraTrip — Development Settings
"""
from .base import *

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Print emails to console in dev
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Skip email verification in development
ACCOUNT_EMAIL_VERIFICATION = 'none'

# Relax security in dev
JWT_REFRESH_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Django debug toolbar (optional — only if installed)
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1']
except ImportError:
    pass

# Use default locmem cache in dev (no Redis required)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    },
}

# Use DB-backed handler in dev — avoids needing the 'axes' named Redis cache
AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'

# Run Celery tasks synchronously in dev (no broker/Redis required)
CELERY_TASK_ALWAYS_EAGER    = True
CELERY_TASK_EAGER_PROPAGATES = False   # swallow task errors so they don't crash the view
