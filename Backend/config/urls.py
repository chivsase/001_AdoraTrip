from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connection
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def health_check(request):
    """
    Lightweight liveness probe used by:
      - Docker HEALTHCHECK in the production Dockerfile
      - Nginx upstream health polling
      - External uptime monitors

    Checks that the DB is reachable. Returns 200 on success, 503 on failure.
    Does NOT require authentication so it can be polled freely.
    """
    try:
        connection.ensure_connection()
        return JsonResponse({"status": "ok"})
    except Exception as exc:
        return JsonResponse({"status": "error", "detail": str(exc)}, status=503)


urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('users.urls', namespace='auth')),
    path('api/v1/organizations/', include('organizations.urls', namespace='organizations')),
    path('api/v1/', include('api.urls', namespace='api')),

    # Health check — used by Docker HEALTHCHECK and load balancers
    path('api/v1/health/', health_check, name='health'),

    # API Documentation (disable in production via Nginx or set SERVE_INCLUDE_SCHEMA=False)
    path('api/schema/',         SpectacularAPIView.as_view(),                           name='schema'),
    path('api/docs/',           SpectacularSwaggerView.as_view(url_name='schema'),      name='swagger-ui'),
    path('api/docs/redoc/',     SpectacularRedocView.as_view(url_name='schema'),        name='redoc'),

    # allauth (handles social OAuth redirects)
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
