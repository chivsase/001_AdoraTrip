from rest_framework import serializers
from .models import Hotel, RoomType, Tour, TourSlot, Attraction, TicketType, Restaurant, TransferRoute, VehicleType


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'capacity', 'bed_type', 'area_sqm', 'base_price', 'amenities', 'images', 'total_units']


class HotelSerializer(serializers.ModelSerializer):
    room_types = RoomTypeSerializer(many=True, read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Hotel
        fields = [
            'id', 'slug', 'name', 'short_description', 'description',
            'destination', 'destination_name', 'address', 'lat', 'lng',
            'cover_image', 'gallery', 'amenities',
            'base_price', 'currency', 'rating_avg', 'rating_count',
            'star_rating', 'check_in_time', 'check_out_time', 'policies',
            'status', 'is_featured', 'room_types',
        ]


class TourSlotSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = TourSlot
        fields = ['id', 'starts_at', 'ends_at', 'available_seats', 'effective_price']


class TourSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Tour
        fields = [
            'id', 'slug', 'name', 'short_description', 'description',
            'destination', 'destination_name', 'address', 'lat', 'lng',
            'cover_image', 'gallery', 'amenities',
            'base_price', 'currency', 'rating_avg', 'rating_count',
            'duration_hours', 'max_participants', 'min_participants',
            'meeting_point', 'includes', 'excludes', 'difficulty', 'languages',
            'status', 'is_featured',
        ]


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = ['id', 'name', 'price', 'description']


class AttractionSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Attraction
        fields = [
            'id', 'slug', 'name', 'short_description', 'description',
            'destination', 'destination_name', 'address', 'lat', 'lng',
            'cover_image', 'gallery', 'amenities',
            'base_price', 'currency', 'rating_avg', 'rating_count',
            'opening_time', 'closing_time', 'open_days', 'visit_duration_minutes',
            'status', 'is_featured', 'ticket_types',
        ]


class RestaurantSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'slug', 'name', 'short_description', 'description',
            'destination', 'destination_name', 'address', 'lat', 'lng',
            'cover_image', 'gallery', 'amenities',
            'base_price', 'currency', 'rating_avg', 'rating_count',
            'cuisine_types', 'price_range', 'opening_time', 'closing_time',
            'total_capacity', 'has_outdoor',
            'status', 'is_featured',
        ]


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = ['id', 'name', 'capacity', 'price', 'amenities', 'available_units', 'image']


class TransferRouteSerializer(serializers.ModelSerializer):
    vehicles = VehicleTypeSerializer(many=True, read_only=True)

    class Meta:
        model = TransferRoute
        fields = [
            'id', 'origin', 'destination_point',
            'origin_lat', 'origin_lng', 'dest_lat', 'dest_lng',
            'duration_minutes', 'distance_km', 'description', 'vehicles',
        ]
