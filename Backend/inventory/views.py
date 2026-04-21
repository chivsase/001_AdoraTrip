from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hotel, Tour, Attraction, Restaurant, TransferRoute, RoomType, TourSlot
from .serializers import (
    HotelSerializer, TourSerializer, AttractionSerializer,
    RestaurantSerializer, TransferRouteSerializer,
    RoomTypeSerializer, TourSlotSerializer,
)
from organizations.permissions import IsOrgManager, IsOrgStaff
from users.permissions import IsPlatformStaff, IsSuperAdmin
from rest_framework.decorators import action
from rest_framework.response import Response


class ActiveListingMixin:
    """Restricts queryset to active listings for public endpoints."""
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'description']
    ordering_fields = ['base_price', 'rating_avg', 'created_at']
    filterset_fields = ['destination', 'is_featured']

    def get_queryset(self):
        return super().get_queryset().filter(status='active').select_related('destination')


class HotelViewSet(ActiveListingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    lookup_field = 'slug'
    filterset_fields = {
        'destination': ['exact'],
        'is_featured': ['exact'],
        'star_rating': ['exact', 'gte', 'lte'],
        'listing_type': ['exact'],
        'base_price': ['gte', 'lte'],
    }


class TourViewSet(ActiveListingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    lookup_field = 'slug'
    filterset_fields = {
        'destination': ['exact'],
        'is_featured': ['exact'],
        'difficulty': ['exact'],
        'duration_hours': ['gte', 'lte'],
        'base_price': ['gte', 'lte'],
    }


class AttractionViewSet(ActiveListingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Attraction.objects.all()
    serializer_class = AttractionSerializer
    lookup_field = 'slug'


class RestaurantViewSet(ActiveListingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    lookup_field = 'slug'
    filterset_fields = ['destination', 'is_featured', 'price_range']


class TransferRouteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransferRoute.objects.filter(is_active=True).prefetch_related('vehicles')
    serializer_class = TransferRouteSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['origin', 'destination_point']


# ─── Vendor / Partner Inventory Management ────────────────────────────────────

class VendorListingMixin:
    """
    Base mixin for vendors managing their own inventory.
    Filters by the organization injected into request.org by OrgContextMiddleware.
    """
    permission_classes = [IsOrgStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        # request.org is set by OrgContextMiddleware
        if not self.request.org:
            return self.queryset.none()
        return self.queryset.filter(organization=self.request.org)

    def perform_create(self, serializer):
        # Automatically assign the organization and creator
        # New listings from vendors are PENDING_REVIEW by default
        serializer.save(
            organization=self.request.org,
            created_by=self.request.user,
            status='pending_review'
        )


class VendorHotelViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


class VendorTourViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer


class VendorAttractionViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = Attraction.objects.all()
    serializer_class = AttractionSerializer


class VendorRestaurantViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer


class VendorTransferViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = TransferRoute.objects.all()
    serializer_class = TransferRouteSerializer


class VendorRoomTypeViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    
    def get_queryset(self):
        if not self.request.org:
            return RoomType.objects.none()
        return RoomType.objects.filter(hotel__organization=self.request.org)


class VendorTourSlotViewSet(VendorListingMixin, viewsets.ModelViewSet):
    queryset = TourSlot.objects.all()
    serializer_class = TourSlotSerializer

    def get_queryset(self):
        if not self.request.org:
            return TourSlot.objects.none()
        return TourSlot.objects.filter(tour__organization=self.request.org)


# ─── Super Admin / Platform Management ────────────────────────────────────────

class AdminListingMixin:
    """
    Centralized management for Super Admins and Platform Staff.
    Allows viewing and moderating ALL listings across the entire platform.
    """
    permission_classes = [IsPlatformStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def approve(self, request, pk=None):
        listing = self.get_object()
        listing.status = 'active'
        listing.save()
        return Response({'status': 'listing approved and active'})

    @action(detail=True, methods=['post'], permission_classes=[IsPlatformStaff])
    def suspend(self, request, pk=None):
        listing = self.get_object()
        listing.status = 'suspended'
        listing.save()
        return Response({'status': 'listing suspended'})


class AdminHotelViewSet(AdminListingMixin, viewsets.ModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


class AdminTourViewSet(AdminListingMixin, viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer


class AdminAttractionViewSet(AdminListingMixin, viewsets.ModelViewSet):
    queryset = Attraction.objects.all()
    serializer_class = AttractionSerializer


class AdminRestaurantViewSet(AdminListingMixin, viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer


class AdminTransferViewSet(AdminListingMixin, viewsets.ModelViewSet):
    queryset = TransferRoute.objects.all()
    serializer_class = TransferRouteSerializer
