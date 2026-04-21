from rest_framework import serializers
from .models import Destination


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = [
            'id', 'name', 'province', 'tagline', 'image',
            'rating_avg', 'review_count', 'listing_count', 'price_from',
            'tag', 'categories', 'is_trending', 'sort_order',
        ]
