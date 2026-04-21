from django.db import models
from .base import AbstractListing


class Hotel(AbstractListing):
    """
    Covers Hotel, Guesthouse, and Beach Resort listing types.
    Each Hotel has one or more RoomTypes; each RoomType has daily RoomInventory rows.
    """
    star_rating = models.PositiveSmallIntegerField(default=3)
    check_in_time = models.TimeField(default='14:00')
    check_out_time = models.TimeField(default='12:00')
    total_rooms = models.PositiveIntegerField(default=0)
    policies = models.JSONField(default=dict)  # cancellation, children, pets, etc.

    class Meta:
        db_table = 'inventory_hotels'

    def save(self, *args, **kwargs):
        if not self.listing_type:
            self.listing_type = 'hotel'
        super().save(*args, **kwargs)


class RoomType(models.Model):
    """A category of room within a hotel (e.g. Deluxe King, Superior Twin)."""
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='room_types')
    name = models.CharField(max_length=100)
    capacity = models.PositiveSmallIntegerField()
    bed_type = models.CharField(max_length=50)
    area_sqm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list)
    images = models.JSONField(default=list)
    total_units = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_room_types'

    def __str__(self):
        return f'{self.hotel.name} — {self.name}'


class RoomInventory(models.Model):
    """
    Daily availability calendar — one row per RoomType per date.
    available_units is decremented when a booking hold is placed.
    """
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='inventory')
    date = models.DateField()
    available_units = models.PositiveIntegerField()
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'inventory_room_inventory'
        unique_together = [('room_type', 'date')]
        indexes = [models.Index(fields=['room_type', 'date'])]

    def __str__(self):
        return f'{self.room_type} | {self.date} | {self.available_units} avail'

    @property
    def effective_price(self):
        return self.price_override if self.price_override is not None else self.room_type.base_price
