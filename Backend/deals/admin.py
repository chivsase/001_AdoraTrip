from django.contrib import admin
from django.utils import timezone
from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'listing_type', 'badge', 'location',
        'original_price', 'sale_price', 'discount_pct',
        'expires_at', 'is_active', 'is_live_display', 'priority',
    ]
    list_filter = ['is_active', 'listing_type', 'badge', 'destination']
    search_fields = ['title', 'location']
    ordering = ['-priority', 'expires_at']
    readonly_fields = ['is_expired', 'is_live', 'created_at', 'updated_at']

    @admin.display(boolean=True, description='Live Now')
    def is_live_display(self, obj):
        return obj.is_live
