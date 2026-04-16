import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

django_asgi_app = get_asgi_application()

# Django Channels routing is set up in each app's routing.py
# and assembled here when Channels is fully configured.
application = django_asgi_app
