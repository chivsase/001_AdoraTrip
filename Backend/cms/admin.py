from django.contrib import admin
from .models import Destination


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'province', 'rating_avg', 'listing_count', 'price_from', 'is_trending', 'is_active', 'sort_order']
    list_filter = ['is_active', 'is_trending']
    search_fields = ['name', 'province']
    prepopulated_fields = {'id': ('name',)}
    ordering = ['sort_order']
