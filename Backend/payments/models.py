import uuid
from django.db import models
from django.conf import settings


class PaymentGateway(models.TextChoices):
    ABA = 'aba', 'ABA PayWay'
    REWARDS = 'rewards', 'Rewards Points'


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'


class Payment(models.Model):
    """
    Tracks transaction records and gateway status.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    gateway = models.CharField(max_length=20, choices=PaymentGateway.choices)
    gateway_payment_id = models.CharField(max_length=200, blank=True)  # ABA Transaction ID
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    
    gateway_response = models.JSONField(default=dict, blank=True)  # Raw callback payload
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'


class CommissionRate(models.Model):
    """
    Admin-configured per-organization or global commission rate.
    """
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='commission_overrides'
    )
    listing_type = models.CharField(max_length=30, blank=True)  # Optional type-specific override
    
    rate_pct = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 15.00
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'payment_commission_rates'


class PayoutStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    PAID = 'paid', 'Paid'
    FAILED = 'failed', 'Failed'


class Payout(models.Model):
    """
    Settlement record for vendors. Scheduled based on T+N completion.
    """
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payout_records'
    )
    
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    commission_rate_pct = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=PayoutStatus.choices,
        default=PayoutStatus.PENDING
    )
    
    gateway_payout_id = models.CharField(max_length=200, blank=True)  # ABA Payout Reference
    scheduled_for = models.DateField()
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_payouts'
