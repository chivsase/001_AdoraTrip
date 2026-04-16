from django.conf import settings
from django.db import models


class Tour(models.Model):
    """Tour model for storing tour/package information."""
    title            = models.CharField(max_length=200)
    description      = models.TextField()
    price            = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours   = models.IntegerField(default=1)
    max_participants = models.IntegerField(default=10)
    is_active        = models.BooleanField(default=True)

    # Owner organization (which partner created this tour)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='tours',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Booking(models.Model):
    """Booking model for tour reservations."""
    BOOKING_STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    tour         = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='bookings')
    guest_name   = models.CharField(max_length=100)
    guest_email  = models.EmailField()
    guest_phone  = models.CharField(max_length=20)
    participants = models.IntegerField(default=1)
    booking_date = models.DateTimeField()
    status       = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='pending')

    # Authenticated traveler (null for guest bookings)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='bookings',
    )

    # Partner org that owns the tour (denormalized for quick scoping)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='bookings',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.guest_name} — {self.tour.title}'

    class Meta:
        ordering = ['-created_at']
