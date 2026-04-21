from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Deal
from .serializers import DealSerializer


class DealViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for active deals.

    Query params:
      ?active=true       — filter to currently live deals only (default behaviour)
      ?listing_type=tour — filter by type
      ?limit=6           — custom page size (max 20)
    """
    serializer_class = DealSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['listing_type', 'badge', 'destination']
    ordering_fields = ['priority', 'expires_at', 'discount_pct']
    ordering = ['-priority', 'expires_at']

    def get_queryset(self):
        qs = Deal.objects.filter(is_active=True)

        # ?active=true (default) — only currently live deals
        active_param = self.request.query_params.get('active', 'true')
        if active_param.lower() == 'true':
            now = timezone.now()
            qs = qs.filter(starts_at__lte=now, expires_at__gt=now)

        # ?limit= custom size (capped at 20 to prevent abuse)
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = min(int(limit), 20)
                qs = qs[:limit]
            except (ValueError, TypeError):
                pass

        return qs
