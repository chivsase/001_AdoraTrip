import uuid
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class BookingStatus(models.TextChoices):
    CART = 'cart', 'Cart'
    PENDING_PAYMENT = 'pending_payment', 'Pending Payment'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'
    COMPLETED = 'completed', 'Completed'
    REFUNDED = 'refunded', 'Refunded'


class Booking(models.Model):
    """
    Unified booking engine. Stores the primary record for any reservation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=12, unique=True, editable=False)  # ADR-YYYY-XXXXX
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_v2'
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='bookings_v2'
    )
    
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.CART
    )
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rewards_redeemed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    rewards_earned = models.PositiveIntegerField(default=0)  # Points to credit after completion
    special_requests = models.TextField(blank=True)
    
    expires_at = models.DateTimeField(null=True, blank=True)  # Cart hold expiry
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.reference:
            # Simple reference generator placeholder
            from django.utils import timezone
            year = timezone.now().year
            rand = uuid.uuid4().hex[:5].upper()
            self.reference = f'ADR-{year}-{rand}'
        super().save(*args, **kwargs)


class BookingItem(models.Model):
    """
    Individual items within a booking. Links to inventory via GenericForeignKey.
    """
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    # Generic FK to link to Hotel, Tour, Attraction, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Snapshot fields (denormalized to lock in data at time of booking)
    listing_name = models.CharField(max_length=200)
    listing_snapshot = models.JSONField()  # Full JSON dump of listing data at booking time
    
    check_in = models.DateField(null=True, blank=True)
    check_out = models.DateField(null=True, blank=True)
    slot_id = models.UUIDField(null=True, blank=True)  # For tours/slots
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'booking_items'


class BookingLock(models.Model):
    """
    Temporary hold record to prevent double-booking during checkout.
    """
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    date_or_slot = models.CharField(max_length=50)  # "2025-06-15" or slot_uuid
    
    quantity = models.PositiveIntegerField()
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    locked_until = models.DateTimeField()

    class Meta:
        db_table = 'booking_locks'
        unique_together = [('content_type', 'object_id', 'date_or_slot')]
