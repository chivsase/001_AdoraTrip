import uuid
from django.db import models
from django.conf import settings


class ListingStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PENDING_REVIEW = 'pending_review', 'Pending Review'
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    ARCHIVED = 'archived', 'Archived'


class PriceRuleType(models.TextChoices):
    SEASONAL_PEAK = 'seasonal_peak', 'Seasonal Peak'
    SEASONAL_OFF = 'seasonal_off', 'Seasonal Off'
    EVENT_SURGE = 'event_surge', 'Event Surge'
    PROMOTIONAL = 'promotional', 'Promotional'
    LAST_MINUTE = 'last_minute', 'Last Minute'


class AbstractListing(models.Model):
    """
    Shared fields for every bookable product type.
    All concrete listing models inherit from this.
    """
    LISTING_TYPES = [
        ('hotel', 'Hotel'),
        ('guesthouse', 'Guesthouse'),
        ('beach_resort', 'Beach Resort'),
        ('tour', 'Tour'),
        ('attraction', 'Attraction'),
        ('restaurant', 'Restaurant'),
        ('transfer', 'Transfer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='%(class)s_listings',
    )
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPES)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)

    destination = models.ForeignKey(
        'cms.Destination',
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_listings',
    )
    address = models.TextField(blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    cover_image = models.URLField(max_length=500, blank=True)
    gallery = models.JSONField(default=list)        # [{"url": "...", "alt": "..."}]
    amenities = models.JSONField(default=list)      # ["wifi", "pool", ...]
    attributes = models.JSONField(default=dict)     # type-specific extra attrs

    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')

    # Aggregated stats — updated by signals on new reviews
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=ListingStatus.choices,
        default=ListingStatus.DRAFT,
    )
    is_featured = models.BooleanField(default=False)

    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f'[{self.listing_type}] {self.name}'

    @property
    def is_active(self):
        return self.status == ListingStatus.ACTIVE


class PriceRule(models.Model):
    """
    Seasonal or rule-based pricing adjustments.
    Applies to a specific listing (Hotel, Tour, etc.) for a date range.
    """
    from django.contrib.contenttypes.fields import GenericForeignKey
    from django.contrib.contenttypes.models import ContentType

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Generic FK to link to any listing type
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    listing = GenericForeignKey('content_type', 'object_id')

    name = models.CharField(max_length=100)  # e.g. "Christmas Peak"
    rule_type = models.CharField(max_length=20, choices=PriceRuleType.choices, default=PriceRuleType.SEASONAL_PEAK)
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Adjustment can be percentage (15.00 for +15%) or fixed amount (50.00 for +$50)
    adjustment_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    adjustment_fixed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    priority = models.PositiveIntegerField(default=1)  # Higher priority wins if rules overlap
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_price_rules'
        ordering = ['-priority', 'start_date']

    def __str__(self):
        return f'{self.name} ({self.start_date} -> {self.end_date})'
