import uuid
from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class BadgeChoice(models.TextChoices):
    FLASH = 'flash', 'Flash Sale'
    HOT = 'hot', 'Hot Deal'
    MEMBER = 'member', 'Member Price'
    BESTSELLER = 'bestseller', 'Best Seller'


class ListingTypeChoice(models.TextChoices):
    HOTEL = 'hotel', 'Hotel'
    TOUR = 'tour', 'Tour'
    PACKAGE = 'package', 'Package'
    ATTRACTION = 'attraction', 'Attraction'
    RESTAURANT = 'restaurant', 'Restaurant'
    TRANSFER = 'transfer', 'Transfer'


class Deal(models.Model):
    """
    A time-limited promotional deal shown on the homepage DealsSection.
    Initially standalone (Phase 0). Phase 1 will add a GenericForeignKey
    to link deals to actual inventory listings.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    image = models.URLField(max_length=500, blank=True)

    # Generic FK to link to Hotel, Tour, Attraction, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.UUIDField(null=True, blank=True)
    listing = GenericForeignKey('content_type', 'object_id')

    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_pct = models.PositiveSmallIntegerField(blank=True)

    listing_type = models.CharField(max_length=20, choices=ListingTypeChoice.choices)
    badge = models.CharField(max_length=20, choices=BadgeChoice.choices, blank=True)
    location = models.CharField(max_length=100, blank=True)

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='deals'
    )

    destination = models.ForeignKey(
        'cms.Destination',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deals_cms',
    )

    starts_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    is_active = models.BooleanField(default=True)
    priority = models.PositiveSmallIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deals'
        ordering = ['-priority', 'expires_at']
        indexes = [
            models.Index(fields=['is_active', 'expires_at']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f'{self.title} (-{self.discount_pct}%) expires {self.expires_at:%Y-%m-%d %H:%M}'

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_live(self):
        now = timezone.now()
        return self.is_active and self.starts_at <= now <= self.expires_at

    def save(self, *args, **kwargs):
        if not self.discount_pct and self.original_price and self.sale_price:
            self.discount_pct = round((1 - self.sale_price / self.original_price) * 100)
        super().save(*args, **kwargs)
