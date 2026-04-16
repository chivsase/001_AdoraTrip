from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models import Tour, Booking
from api.serializers import TourSerializer, BookingSerializer
from organizations.permissions import IsOrgStaff
from users.permissions import IsAuthenticatedAndVerified, IsBookingOwner, IsPlatformStaff


class TourViewSet(viewsets.ModelViewSet):
    """
    Public read / partner-only write for tour listings.
    """
    queryset         = Tour.objects.filter(is_active=True).select_related('organization')
    serializer_class = TourSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'active_tours'):
            return [AllowAny()]
        # Create / update / delete requires an active org member
        return [IsOrgStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Partners only see their own org's tours for write actions
        if self.action not in ('list', 'retrieve', 'active_tours'):
            if hasattr(self.request, 'org') and self.request.org:
                qs = qs.filter(organization=self.request.org)
        return qs

    def perform_create(self, serializer):
        serializer.save(organization=getattr(self.request, 'org', None))

    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def active_tours(self, request):
        """GET /api/v1/tours/active_tours/ — public list of active tours."""
        serializer = self.get_serializer(
            Tour.objects.filter(is_active=True).select_related('organization'),
            many=True,
        )
        return Response(serializer.data)

    @action(detail=True, methods=['GET'], permission_classes=[IsOrgStaff])
    def bookings(self, request, pk=None):
        """GET /api/v1/tours/{id}/bookings/ — partner sees bookings for their tour."""
        tour      = self.get_object()
        bookings  = tour.bookings.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    Travelers: create and view own bookings.
    Org staff: view + manage bookings for their org.
    Platform staff: read all.
    """
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticatedAndVerified()]
        if self.action in ('list',):
            return [IsAuthenticatedAndVerified()]
        if self.action in ('retrieve', 'update', 'partial_update'):
            return [IsBookingOwner() | IsOrgStaff()]
        if self.action in ('confirm', 'cancel'):
            return [IsOrgStaff()]
        if self.action == 'pending_bookings':
            return [IsOrgStaff()]
        return [IsPlatformStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Booking.objects.none()

        # Org staff/manager/owner → see org's bookings
        if hasattr(self.request, 'org') and self.request.org:
            return Booking.objects.filter(
                organization=self.request.org
            ).select_related('tour', 'user')

        # Platform staff → see all
        from users.models import PlatformRole
        if user.platform_role in (PlatformRole.SUPER_ADMIN, PlatformRole.PLATFORM_STAFF):
            return Booking.objects.all().select_related('tour', 'user')

        # Traveler → own bookings only
        return Booking.objects.filter(user=user).select_related('tour')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            user=user,
            guest_name=user.full_name or serializer.validated_data.get('guest_name', ''),
            guest_email=user.email,
            organization=serializer.validated_data['tour'].organization,
        )

    @action(detail=False, methods=['GET'])
    def pending_bookings(self, request):
        """GET /api/v1/bookings/pending_bookings/ — org staff."""
        qs = self.get_queryset().filter(status='pending')
        return Response(BookingSerializer(qs, many=True).data)

    @action(detail=True, methods=['POST'])
    def confirm(self, request, pk=None):
        """POST /api/v1/bookings/{id}/confirm/ — org staff."""
        booking = self.get_object()
        if booking.status != 'pending':
            return Response({'error': 'Only pending bookings can be confirmed.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'confirmed'
        booking.save(update_fields=['status'])
        return Response({'status': 'Booking confirmed.'})

    @action(detail=True, methods=['POST'])
    def cancel(self, request, pk=None):
        """POST /api/v1/bookings/{id}/cancel/ — traveler (owner) or org staff."""
        booking = self.get_object()
        if booking.status in ('completed', 'cancelled'):
            return Response({'error': 'Cannot cancel a completed or already cancelled booking.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response({'status': 'Booking cancelled.'})
