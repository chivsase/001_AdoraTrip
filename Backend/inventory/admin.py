from django.contrib import admin
from .models import Hotel, RoomType, RoomInventory, Tour, TourSchedule, TourSlot
from .models import Attraction, TicketType, Restaurant, TableSlot, TransferRoute, VehicleType


class RoomTypeInline(admin.TabularInline):
    model = RoomType
    extra = 1


class TourScheduleInline(admin.TabularInline):
    model = TourSchedule
    extra = 1


class TicketTypeInline(admin.TabularInline):
    model = TicketType
    extra = 1


class VehicleTypeInline(admin.TabularInline):
    model = VehicleType
    extra = 1


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'listing_type', 'destination', 'star_rating', 'base_price', 'status', 'is_featured']
    list_filter = ['status', 'listing_type', 'star_rating', 'is_featured']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RoomTypeInline]


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'duration_hours', 'base_price', 'status', 'is_featured']
    list_filter = ['status', 'difficulty', 'is_featured']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [TourScheduleInline]


@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'base_price', 'status']
    search_fields = ['name', 'slug']
    inlines = [TicketTypeInline]


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'price_range', 'base_price', 'status']
    search_fields = ['name', 'slug']


@admin.register(TransferRoute)
class TransferRouteAdmin(admin.ModelAdmin):
    list_display = ['origin', 'destination_point', 'duration_minutes', 'organization', 'is_active']
    inlines = [VehicleTypeInline]
