from rest_framework import serializers
from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    is_live = serializers.BooleanField(read_only=True)
    badge_display = serializers.CharField(source='get_badge_display', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)

    class Meta:
        model = Deal
        fields = [
            'id', 'title', 'description', 'image',
            'original_price', 'sale_price', 'discount_pct',
            'listing_type', 'listing_type_display',
            'badge', 'badge_display',
            'location', 'destination',
            'starts_at', 'expires_at',
            'is_active', 'is_expired', 'is_live',
            'priority',
        ]
