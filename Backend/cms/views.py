from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Destination
from .serializers import DestinationSerializer


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for travel destinations.
    Supports filtering by category via ?categories=Beach
    and search via ?search=siem
    """
    queryset = Destination.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_trending']
    search_fields = ['name', 'province', 'tagline']
    ordering_fields = ['sort_order', 'rating_avg', 'price_from']
    pagination_class = None  # Return full list — there are only ~10 destinations
