from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tour, Booking
from .serializers import TourSerializer, BookingSerializer


class TourViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tour model
    Provides CRUD operations for tours
    """
    queryset = Tour.objects.all()
    serializer_class = TourSerializer

    @action(detail=False, methods=['GET'])
    def active_tours(self, request):
        """Get all active tours"""
        active_tours = Tour.objects.filter(is_active=True)
        serializer = self.get_serializer(active_tours, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def bookings(self, request, pk=None):
        """Get all bookings for a specific tour"""
        tour = self.get_object()
        bookings = tour.bookings.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking model
    Provides CRUD operations for bookings
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @action(detail=False, methods=['GET'])
    def pending_bookings(self, request):
        """Get all pending bookings"""
        pending = Booking.objects.filter(status='pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def confirm(self, request, pk=None):
        """Confirm a pending booking"""
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'confirmed'
            booking.save()
            return Response({'status': 'Booking confirmed'})
        return Response({'error': 'Booking is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'Booking cancelled'})
