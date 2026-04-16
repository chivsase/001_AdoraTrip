from django.contrib import admin
from .models import Tour, Booking


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'duration_hours', 'max_participants', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Tour Information', {
            'fields': ('title', 'description', 'price', 'duration_hours', 'max_participants', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('guest_name', 'tour', 'participants', 'status', 'booking_date', 'created_at')
    list_filter = ('status', 'booking_date', 'created_at')
    search_fields = ('guest_name', 'guest_email', 'tour__title')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Booking Information', {
            'fields': ('tour', 'status', 'booking_date')
        }),
        ('Guest Information', {
            'fields': ('guest_name', 'guest_email', 'guest_phone')
        }),
        ('Participants', {
            'fields': ('participants',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
