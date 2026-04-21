from django.db import models
from django.conf import settings


class TransferRoute(models.Model):
    """
    A point-to-point transfer route operated by a transport vendor.
    e.g. Phnom Penh Airport → City Centre, or Siem Reap → Battambang.
    """
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='transfer_routes',
    )
    origin = models.CharField(max_length=200)
    destination_point = models.CharField(max_length=200)
    origin_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    origin_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dest_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dest_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    duration_minutes = models.PositiveIntegerField()
    distance_km = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_transfer_routes',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_transfer_routes'

    def __str__(self):
        return f'{self.origin} → {self.destination_point}'


class VehicleType(models.Model):
    """
    A vehicle category available on a transfer route.
    e.g. Sedan (3 pax), Minivan (8 pax), Luxury SUV.
    """
    route = models.ForeignKey(TransferRoute, on_delete=models.CASCADE, related_name='vehicles')
    name = models.CharField(max_length=100)
    capacity = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list)   # ["ac", "wifi", "water"]
    available_units = models.PositiveIntegerField(default=1)
    image = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_vehicle_types'

    def __str__(self):
        return f'{self.route} | {self.name} ({self.capacity} pax)'
