from django.db import models
from .base import AbstractListing


class Attraction(AbstractListing):
    """
    Museums, temples, theme parks, and other ticketed attractions.
    Each Attraction has one or more TicketTypes (adult, child, VIP, etc.).
    """
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    open_days = models.JSONField(default=list)   # [0,1,2,3,4,5,6]
    visit_duration_minutes = models.PositiveIntegerField(default=120)

    class Meta:
        db_table = 'inventory_attractions'

    def save(self, *args, **kwargs):
        if not self.listing_type:
            self.listing_type = 'attraction'
        super().save(*args, **kwargs)


class TicketType(models.Model):
    """A category of ticket for an attraction (adult, child, student, VIP)."""
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='ticket_types')
    name = models.CharField(max_length=100)     # "Adult", "Child (3-12)", "VIP"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_ticket_types'

    def __str__(self):
        return f'{self.attraction.name} — {self.name}'
