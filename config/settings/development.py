"""
AdoraTour — Development Settings
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

# Use memory cache for axes in development (no Redis required)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    },
    'axes': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'axes',
    },
}

AXES_HANDLER = 'axes.handlers.cache.AxesCacheHandler'
