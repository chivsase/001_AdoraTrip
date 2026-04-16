from rest_framework import serializers
from .models import Tour, Booking


class TourSerializer(serializers.ModelSerializer):
    """Serializer for Tour model"""
    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'description', 'price', 'duration_hours',
            'max_participants', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    tour_title = serializers.CharField(source='tour.title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'tour', 'tour_title', 'guest_name', 'guest_email',
            'guest_phone', 'participants', 'booking_date', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
