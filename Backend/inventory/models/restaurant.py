from django.db import models
from .base import AbstractListing


class Restaurant(AbstractListing):
    """
    Restaurants, street food experiences, and dining packages.
    TableSlots are bookable time windows.
    """
    cuisine_types = models.JSONField(default=list)   # ["Khmer", "BBQ", "Seafood"]
    price_range = models.CharField(
        max_length=5,
        choices=[('$', 'Budget'), ('$$', 'Mid-range'), ('$$$', 'Fine Dining')],
        default='$$',
    )
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    total_capacity = models.PositiveIntegerField(default=0)
    has_outdoor = models.BooleanField(default=False)

    class Meta:
        db_table = 'inventory_restaurants'

    def save(self, *args, **kwargs):
        if not self.listing_type:
            self.listing_type = 'restaurant'
        super().save(*args, **kwargs)


class TableSlot(models.Model):
    """A bookable dining slot (date + time + party size)."""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='table_slots')
    date = models.DateField()
    time = models.TimeField()
    available_seats = models.PositiveIntegerField()
    max_party_size = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_table_slots'
        indexes = [models.Index(fields=['restaurant', 'date', 'time'])]

    def __str__(self):
        return f'{self.restaurant.name} | {self.date} {self.time}'
