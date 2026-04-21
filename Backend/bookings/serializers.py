from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Booking, BookingItem, BookingStatus, BookingLock


class BookingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingItem
        fields = [
            'id', 'listing_name', 'check_in', 'check_out', 'slot_id',
            'quantity', 'unit_price', 'line_total'
        ]


class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference', 'status', 'subtotal', 'discount_amount',
            'rewards_redeemed', 'total', 'rewards_earned', 'special_requests',
            'expires_at', 'items', 'created_at'
        ]


class CreateBookingSerializer(serializers.Serializer):
    """
    Input serializer for creating a booking.
    Supports multi-item bookings (cart-style).
    """
    class ItemData(serializers.Serializer):
        listing_id = serializers.UUIDField()
        listing_type = serializers.ChoiceField(choices=['hotel', 'tour', 'attraction'])
        check_in = serializers.DateField(required=False)
        check_out = serializers.DateField(required=False)
        slot_id = serializers.UUIDField(required=False)
        quantity = serializers.IntegerField(min_value=1)

    items = ItemData(many=True)
    special_requests = serializers.CharField(required=False, allow_blank=True)
    rewards_to_redeem = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
