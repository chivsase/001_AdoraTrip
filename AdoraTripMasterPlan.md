AdoraTrip Master Plan
Preliminary Analysis
Your stack is already well-chosen and partially implemented:

Frontend: Next.js 16 + React 19 + Tailwind 4 + MUI 7 — keep as-is
Backend: Django 5.1 + DRF + SimpleJWT — solid, extend it
Infra: PostgreSQL 16 + Redis 7 + Celery — production-ready
Auth: JWT with HttpOnly refresh cookie — correct pattern
What exists: auth system, basic Tour/Booking models, Organizations/multi-tenancy scaffolding, 9 platform roles, Docker infra.

What's missing: everything product-specific — inventory polymorphism, payments, deals engine, rewards, vendor portal, admin portal, CMS, geo-search.

1. System Architecture & Tech Stack
Confirmed Stack (No Changes Needed)
Layer	Technology	Rationale
Frontend	Next.js 16 App Router	Already built, works
Backend	Django 5.1 + DRF	Already scaffolded, DRF's serializers handle polymorphism well
Database	PostgreSQL 16	JSONB for flexible attributes, full-text search, PostGIS for geo
Cache	Redis 7	Session locking for booking concurrency
Queue	Celery 5	Email, payout webhooks, deal expiry jobs
Realtime	Django Channels + Daphne	Booking status push, availability updates
Extensions to Add
PostgreSQL PostGIS — required for Map Explorer feature. Add to docker-compose.yml:


image: postgis/postgis:16-3.4
27: Image Storage: Use Cloudflare R2 (S3-compatible, zero egress fees) instead of AWS S3. Your .env.example already has AWS_* vars — R2 uses the same django-storages S3 backend, just swap the endpoint URL.
28: 
29: Payment: ABA PayWay (local gateway for Cambodia). We will use ABA PayWay checkout for transactions, requiring API keys and merchant IDs for the payload.

2. Database Schema Blueprint
2a. Multi-Tenant Core
Your existing Organization + CustomUser + PlatformRole is the right foundation. Extend it:


Backend/
├── users/
│   └── models.py          # CustomUser (exists), add: RewardsAccount
├── organizations/
│   └── models.py          # Organization (exists), add: CommissionRate, PayoutAccount
├── inventory/             # NEW APP — all bookable products
│   ├── models/
│   │   ├── base.py        # AbstractListing (shared fields)
│   │   ├── hotel.py       # Hotel, RoomType, RoomInventory
│   │   ├── tour.py        # Tour, TourSchedule, TourSlot
│   │   ├── attraction.py  # Attraction, TicketType
│   │   ├── restaurant.py  # Restaurant, TableSlot
│   │   └── transfer.py    # TransferRoute, VehicleType
├── bookings/              # NEW APP — unified booking engine
│   └── models.py          # Booking, BookingItem, BookingLock
├── deals/                 # NEW APP — flash sales engine
│   └── models.py          # Deal, DealInventory
├── rewards/               # NEW APP — loyalty points
│   └── models.py          # RewardsAccount, RewardsTransaction
├── payments/              # NEW APP — payment + payout split
│   └── models.py          # Payment, Payout, CommissionLedger
├── cms/                   # NEW APP — travel guide CMS
│   └── models.py          # Article, ArticleCategory, Destination
2b. Polymorphic Inventory Schema
The core challenge: Hotel needs rooms+nightly rates; Tour needs slots+headcount; Transfer needs routes+vehicles. Use multi-table inheritance with a shared AbstractListing:


# inventory/models/base.py
class AbstractListing(models.Model):
    """Shared fields for all bookable product types."""
    LISTING_TYPES = [
        ('hotel', 'Hotel'), ('guesthouse', 'Guesthouse'),
        ('beach_resort', 'Beach Resort'), ('tour', 'Tour'),
        ('attraction', 'Attraction'), ('restaurant', 'Restaurant'),
        ('transfer', 'Transfer'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    organization = models.ForeignKey('organizations.Organization', ...)
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPES)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    destination = models.ForeignKey('cms.Destination', ...)
    address = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=6)  # PostGIS point
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    cover_image = models.URLField()              # R2/S3 URL
    gallery = models.JSONField(default=list)     # [{"url": ..., "alt": ...}]
    amenities = models.JSONField(default=list)   # ["wifi", "pool", ...]
    attributes = models.JSONField(default=dict)  # Type-specific attrs
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)  # Super admin gate
    is_featured = models.BooleanField(default=False)
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
Hotel-specific extension:


# inventory/models/hotel.py
class Hotel(AbstractListing):
    """Inherits AbstractListing + hotel-specific fields."""
    star_rating = models.PositiveSmallIntegerField(default=3)
    check_in_time = models.TimeField(default='14:00')
    check_out_time = models.TimeField(default='12:00')
    total_rooms = models.PositiveIntegerField(default=0)
    policies = models.JSONField(default=dict)  # cancellation, children, pets

class RoomType(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='room_types', ...)
    name = models.CharField(max_length=100)     # "Deluxe King", "Superior Twin"
    capacity = models.PositiveSmallIntegerField()
    bed_type = models.CharField(max_length=50)
    area_sqm = models.DecimalField(max_digits=5, decimal_places=1)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list)
    images = models.JSONField(default=list)
    total_units = models.PositiveIntegerField()

class RoomInventory(models.Model):
    """Daily availability calendar — one row per room_type per date."""
    room_type = models.ForeignKey(RoomType, ...)
    date = models.DateField()
    available_units = models.PositiveIntegerField()
    price_override = models.DecimalField(null=True, blank=True, ...)  # Dynamic pricing
    class Meta:
        unique_together = [('room_type', 'date')]
        indexes = [models.Index(fields=['room_type', 'date'])]
Tour-specific extension:


# inventory/models/tour.py
class Tour(AbstractListing):
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1)
    max_participants = models.PositiveIntegerField()
    min_participants = models.PositiveIntegerField(default=1)
    meeting_point = models.TextField()
    includes = models.JSONField(default=list)  # ["lunch", "transport", ...]
    excludes = models.JSONField(default=list)
    difficulty = models.CharField(max_length=20)  # easy/moderate/hard
    languages = models.JSONField(default=list)    # ["en", "km", "zh"]

class TourSchedule(models.Model):
    """Recurring schedule rule — e.g., every Mon/Wed/Fri at 08:00."""
    tour = models.ForeignKey(Tour, related_name='schedules', ...)
    weekdays = models.JSONField()   # [0,1,2,3,4,5,6]
    start_time = models.TimeField()
    is_active = models.BooleanField(default=True)

class TourSlot(models.Model):
    """Concrete date+time slot generated from TourSchedule."""
    tour = models.ForeignKey(Tour, related_name='slots', ...)
    schedule = models.ForeignKey(TourSchedule, null=True, ...)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    available_seats = models.PositiveIntegerField()
    price_override = models.DecimalField(null=True, blank=True, ...)
    class Meta:
        indexes = [models.Index(fields=['tour', 'starts_at'])]
Transfer-specific extension:


# inventory/models/transfer.py
class TransferRoute(models.Model):
    organization = models.ForeignKey('organizations.Organization', ...)
    origin = models.CharField(max_length=200)
    destination_point = models.CharField(max_length=200)
    origin_lat = models.DecimalField(max_digits=9, decimal_places=6)
    origin_lng = models.DecimalField(max_digits=9, decimal_places=6)
    dest_lat = models.DecimalField(max_digits=9, decimal_places=6)
    dest_lng = models.DecimalField(max_digits=9, decimal_places=6)
    duration_minutes = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

class VehicleType(models.Model):
    route = models.ForeignKey(TransferRoute, related_name='vehicles', ...)
    name = models.CharField(max_length=100)   # "Minivan (8 pax)", "Sedan"
    capacity = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list) # ["ac", "wifi"]
    available_units = models.PositiveIntegerField()
2c. Unified Booking Schema

# bookings/models.py
class Booking(models.Model):
    STATUS = [
        ('cart', 'Cart'), ('pending_payment', 'Pending Payment'),
        ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'),
        ('completed', 'Completed'), ('refunded', 'Refunded'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    reference = models.CharField(max_length=12, unique=True)  # ADR-2025-XXXXX
    user = models.ForeignKey('users.CustomUser', ...)
    organization = models.ForeignKey('organizations.Organization', ...)
    status = models.CharField(max_length=20, choices=STATUS, default='cart')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rewards_redeemed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    rewards_earned = models.PositiveIntegerField(default=0)  # Points to credit on completion
    special_requests = models.TextField(blank=True)
    expires_at = models.DateTimeField()  # Cart/lock expiry (15 min)
    created_at = models.DateTimeField(auto_now_add=True)

class BookingItem(models.Model):
    booking = models.ForeignKey(Booking, related_name='items', ...)
    content_type = models.ForeignKey(ContentType, ...)   # Points to Hotel/Tour/etc
    object_id = models.UUIDField()                        # The listing's PK
    content_object = GenericForeignKey('content_type', 'object_id')
    # Type-specific snapshot (denormalized for immutability)
    listing_name = models.CharField(max_length=200)
    listing_snapshot = models.JSONField()    # Price, details at time of booking
    check_in = models.DateField(null=True)
    check_out = models.DateField(null=True)
    slot_id = models.UUIDField(null=True)    # For tour slots
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

class BookingLock(models.Model):
    """Redis-backed optimistic lock preventing double-booking."""
    content_type = models.ForeignKey(ContentType, ...)
    object_id = models.UUIDField()
    date_or_slot = models.CharField(max_length=50)  # "2025-06-15" or slot_uuid
    quantity = models.PositiveIntegerField()
    booking = models.ForeignKey(Booking, ...)
    locked_until = models.DateTimeField()
    class Meta:
        unique_together = [('content_type', 'object_id', 'date_or_slot')]
2d. Deals Schema

# deals/models.py
class Deal(models.Model):
    BADGE_CHOICES = [('flash', 'Flash Sale'), ('hot', 'Hot Deal'),
                     ('member', 'Member Price'), ('bestseller', 'Best Seller')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200)
    content_type = models.ForeignKey(ContentType, ...)   # Hotel, Tour, etc.
    object_id = models.UUIDField()
    listing = GenericForeignKey('content_type', 'object_id')
    organization = models.ForeignKey('organizations.Organization', ...)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_pct = models.PositiveSmallIntegerField()
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    max_redemptions = models.PositiveIntegerField(null=True)
    redemption_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    priority = models.PositiveSmallIntegerField(default=0)  # Homepage sort order

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_sold_out(self):
        return self.max_redemptions and self.redemption_count >= self.max_redemptions
2e. Rewards Schema

# rewards/models.py
class RewardsAccount(models.Model):
    user = models.OneToOneField('users.CustomUser', ...)
    balance = models.PositiveIntegerField(default=0)   # Points balance
    lifetime_earned = models.PositiveIntegerField(default=0)
    lifetime_redeemed = models.PositiveIntegerField(default=0)
    tier = models.CharField(max_length=20, default='bronze')  # bronze/silver/gold/platinum

class RewardsTransaction(models.Model):
    TYPE = [('earn', 'Earn'), ('redeem', 'Redeem'),
            ('expire', 'Expire'), ('bonus', 'Bonus')]
    account = models.ForeignKey(RewardsAccount, related_name='transactions', ...)
    booking = models.ForeignKey('bookings.Booking', null=True, ...)
    type = models.CharField(max_length=10, choices=TYPE)
    points = models.IntegerField()   # Positive = earn, negative = redeem
    balance_after = models.PositiveIntegerField()
    description = models.CharField(max_length=200)
    expires_at = models.DateField(null=True)   # Points expire after 12 months
    created_at = models.DateTimeField(auto_now_add=True)
2f. Payment & Commission Schema

# payments/models.py
class Payment(models.Model):
290:     GATEWAY = [('aba', 'ABA PayWay'), ('rewards', 'Rewards Only')]
291:     STATUS = [('pending', 'Pending'), ('completed', 'Completed'),
292:               ('failed', 'Failed'), ('refunded', 'Refunded')]
293:     id = models.UUIDField(primary_key=True, default=uuid.uuid4)
294:     booking = models.ForeignKey('bookings.Booking', ...)
295:     gateway = models.CharField(max_length=20, choices=GATEWAY)
296:     gateway_payment_id = models.CharField(max_length=200)  # ABA Transaction ID
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS)
    gateway_response = models.JSONField(default=dict)   # Raw webhook payload
    created_at = models.DateTimeField(auto_now_add=True)

class CommissionRate(models.Model):
    """Admin-configured per-organization or global commission rate."""
    organization = models.ForeignKey('organizations.Organization', null=True, blank=True)
    listing_type = models.CharField(max_length=20, null=True, blank=True)  # Optional type override
    rate_pct = models.DecimalField(max_digits=5, decimal_places=2)   # e.g., 15.00
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)

class Payout(models.Model):
    STATUS = [('pending', 'Pending'), ('processing', 'Processing'),
              ('paid', 'Paid'), ('failed', 'Failed')]
    organization = models.ForeignKey('organizations.Organization', ...)
    booking = models.ForeignKey('bookings.Booking', ...)
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_rate_pct = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
321:     gateway_payout_id = models.CharField(max_length=200, blank=True)  # ABA Payout Reference
    scheduled_for = models.DateField()  # T+2 or weekly batch
    paid_at = models.DateTimeField(null=True)
3. Core Logic & Algorithms
3a. Rewards System
Earning Rules:


Points = floor(booking_total_USD × earn_rate × tier_multiplier)

earn_rate = 10 points per $1 USD spent
tier_multiplier:
  bronze   (0–999 pts lifetime):    1.0×
  silver   (1,000–4,999 pts):       1.25×
  gold     (5,000–14,999 pts):      1.5×
  platinum (15,000+ pts):           2.0×

Earning cap: max 5,000 points per single booking
Points expire: 12 months after earning if unused
Redemption rate: 100 points = $1 USD off (max 20% of booking total)
Celery task for expiry:


# rewards/tasks.py
@shared_task
def expire_old_points():
    """Run daily — expire points older than 12 months."""
    cutoff = date.today()
    expiring = RewardsTransaction.objects.filter(
        type='earn', expires_at__lte=cutoff,
        account__balance__gt=0
    )
    for txn in expiring:
        # Deduct from balance, create 'expire' transaction
3b. Booking Engine — Concurrency Control
The critical problem: two users trying to book the last room simultaneously. Solution: Redis-based optimistic locking with a database fallback.


BOOKING FLOW:
1.  User selects dates/slot → POST /bookings/cart/
2.  Backend: SELECT FOR UPDATE the inventory row (DB-level lock)
3.  Check available_units >= requested quantity
4.  If yes: decrement available_units (soft hold)
5.  Create BookingLock record with expires_at = now + 15min
365: 6.  Also SET Redis key: "lock:{content_type}:{object_id}:{date}" = booking_id EX 900
366: 7.  Return booking_id + payment payload (ABA PayWay forms)
367: 8.  User completes payment → POST /payments/confirm/
368: 9.  ABA webhook/callback fires → BookingService.confirm(booking_id)
369: 10. Mark Booking.status = 'confirmed', BookingLock.expires_at = null
11. Send confirmation email (Celery), credit rewards (Celery)

IF payment fails or times out:
- Celery beat task every 5 minutes: find BookingLocks past expiry
- Restore available_units, delete BookingLock, mark Booking 'cancelled'
- Redis key auto-expires via TTL

CONCURRENCY GUARD (Step 2 detail):
def reserve_inventory(item_type, object_id, date_key, qty, booking_id):
    with transaction.atomic():
        inventory = RoomInventory.objects.select_for_update().get(
            room_type_id=object_id, date=date_key
        )
        if inventory.available_units < qty:
            raise InventoryExhaustedError()
        inventory.available_units -= qty
        inventory.save()
        BookingLock.objects.create(...)
3c. Payment & Split-Routing Flow

389: PAYMENT FLOW:
390: 1.  Frontend: POST /api/v1/payments/create-checkout/
391:     Body: { booking_id, gateway: "aba" }
392: 2.  Backend:
393:     a. Calculate: total = booking.total - rewards_redeemed
394:     b. Generate ABA PayWay payload (hash signature, tran_id, amount)
395:     c. Return checkout parameters to frontend
396: 3.  Frontend: Render ABA checkout popup / redirect
397: 4.  ABA webhook → POST /api/v1/webhooks/aba/
398: 5.  Backend webhook handler:
399:     a. Verify ABA signature
400:     b. Booking.status = 'confirmed'
401:     c. Create Payment record
    d. Compute payout split:
         commission_rate = CommissionRate.get_for(org, listing_type)
         commission = total × commission_rate / 100
         net_payout = total - commission
    e. Create Payout(status='pending', net_amount=net_payout, scheduled_for=T+2)
    f. Trigger Celery tasks: send_confirmation_email, credit_rewards_points

PAYOUT SCHEDULE (Celery Beat — runs daily):
def process_pending_payouts():
    due = Payout.objects.filter(status='pending', scheduled_for__lte=today)
    for payout in due:
        # Stripe Connect Transfer to vendor's connected account
        stripe.Transfer.create(
            amount=int(payout.net_amount * 100),
            currency="usd",
            destination=payout.organization.stripe_account_id,
            transfer_group=str(payout.booking_id),
        )
        payout.status = 'processing'
4. Actionable Implementation Roadmap
Phase 0 — Foundation Cleanup (Week 1)
Goal: Clean up the existing backend to match the new schema.


Tasks:
□ Add PostGIS to docker-compose.yml (postgis/postgis:16-3.4)
□ Install: psycopg2-binary[c], django.contrib.gis, Pillow
□ Create 5 new Django apps: inventory, bookings, deals, rewards, payments, cms
□ Delete old api/models.py Tour + Booking (migrate to new apps)
433: □ Extend Organization model: aba_account_id, commission_rate_default, is_approved
□ Extend CustomUser: rewards_tier, avatar_url (switch from ImageField to URLField)
□ Run initial migrations
□ Configure django-storages + R2 in settings/base.py
Directories to create:


Backend/
├── inventory/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── hotel.py
│   │   ├── tour.py
│   │   ├── attraction.py
│   │   ├── restaurant.py
│   │   └── transfer.py
│   ├── serializers/
│   ├── views/
│   ├── urls.py
│   └── admin.py
├── bookings/
├── deals/
├── rewards/
├── payments/
└── cms/
Phase 1 — Inventory API (Weeks 2–3)
Goal: Vendors can create/manage listings; public can search them.


APIs to build:
□ GET  /api/v1/listings/                    # Unified search (all types)
□ GET  /api/v1/listings/{type}/             # Type-filtered: /hotels/, /tours/, etc.
□ GET  /api/v1/listings/{type}/{slug}/      # Detail page
□ POST /api/v1/listings/{type}/             # Vendor creates listing
□ PUT  /api/v1/listings/{type}/{slug}/      # Vendor updates listing
□ GET  /api/v1/listings/hotels/{slug}/availability/  # Room calendar
□ GET  /api/v1/listings/tours/{slug}/slots/          # Available tour slots
□ GET  /api/v1/destinations/               # CMS destinations list
□ GET  /api/v1/destinations/{slug}/        # Destination detail + listings

Frontend integration:
□ Replace hardcoded data in DestinationCards.tsx with GET /api/v1/destinations/
□ Replace hardcoded data in DealsSection.tsx with GET /api/v1/deals/?active=true
□ Replace hardcoded data in PopularCities.tsx with destinations API
□ Add search functionality to HeroSearch.tsx → GET /api/v1/listings/?q=&destination=&type=
Phase 2 — Booking Engine (Weeks 4–5)
Goal: Users can complete end-to-end bookings with payment.


APIs to build:
□ POST /api/v1/bookings/                    # Create cart/hold
□ GET  /api/v1/bookings/{id}/               # Get booking detail
□ POST /api/v1/bookings/{id}/apply-rewards/ # Apply rewards points
487: □ POST /api/v1/payments/create-checkout/    # Generate ABA checkout payload
488: □ POST /api/v1/webhooks/aba/                # ABA webhook handler
□ GET  /api/v1/bookings/my/                 # User's booking history

Frontend pages to build (new routes):
□ /listings/[type]/[slug]/         # Listing detail page
□ /bookings/[id]/                  # Booking summary + payment
□ /bookings/[id]/confirmation/     # Post-payment confirmation
□ /dashboard/bookings/             # User booking history (in existing dashboard)

Celery tasks:
□ release_expired_booking_locks    # Every 5 minutes
□ send_booking_confirmation_email  # On payment success
□ credit_rewards_on_completion     # When booking status → 'completed'
Phase 3 — Deals Engine (Week 6)
Goal: Super admin and vendors can create flash deals; frontend countdown works from API.


APIs:
□ GET  /api/v1/deals/?active=true           # Public: active deals
□ POST /api/v1/deals/                       # Vendor creates deal proposal
□ PUT  /api/v1/admin/deals/{id}/approve/    # Super admin approves

Celery tasks:
□ deactivate_expired_deals                  # Every minute (Celery Beat)
□ notify_vendor_deal_expiring_soon          # 1 hour before expiry

Frontend integration:
□ DealsSection.tsx already has the right UI — just wire to GET /api/v1/deals/
□ Add WebSocket connection for real-time countdown sync (optional, nice-to-have)
Phase 4 — Vendor Portal (Weeks 7–9)
Goal: Partners can self-register, manage inventory, view earnings.


New Frontend app routes (under (dashboard)/ with role guard):
□ /vendor/onboarding/              # Multi-step vendor registration wizard
□ /vendor/listings/                # Vendor's listings CRUD
□ /vendor/listings/new/            # Create new listing (type selector)
□ /vendor/listings/[id]/edit/      # Edit listing
□ /vendor/listings/[id]/availability/ # Manage room/slot calendar
□ /vendor/bookings/                # Incoming bookings management
□ /vendor/deals/                   # Create/manage deal proposals
□ /vendor/earnings/                # Revenue + payout history
530: □ /vendor/settings/                # Bank/ABA connect setup

Backend APIs:
□ POST /api/v1/vendor/register/    # Vendor applies for account
□ GET  /api/v1/vendor/dashboard/   # Summary stats
□ GET  /api/v1/vendor/bookings/    # Their bookings
□ GET  /api/v1/vendor/payouts/     # Their payout history
537: □ POST /api/v1/vendor/connect-aba/    # ABA Bank payout info
Phase 5 — Super Admin Portal (Weeks 10–11)
Goal: Platform owners can approve vendors, set commissions, view platform-wide analytics.


Frontend routes (under (dashboard)/ with SUPER_ADMIN role guard):
□ /admin/vendors/                  # Pending vendor approvals queue
□ /admin/vendors/[id]/             # Vendor detail + approve/reject
□ /admin/listings/                 # All listings moderation
□ /admin/bookings/                 # Platform-wide bookings
□ /admin/deals/                    # Approve/reject deal proposals
□ /admin/commissions/              # Set commission rates per vendor/type
□ /admin/payouts/                  # Trigger/view all payouts
□ /admin/analytics/                # Revenue, GMV, user growth charts
□ /admin/cms/articles/             # Travel guide content management
□ /admin/cms/destinations/         # Manage destination pages

Backend APIs:
□ PUT  /api/v1/admin/vendors/{id}/approve/
□ POST /api/v1/admin/commissions/
□ GET  /api/v1/admin/analytics/revenue/
□ GET  /api/v1/admin/analytics/bookings/
□ POST /api/v1/admin/payouts/batch/ # Trigger batch payout run
Phase 6 — Map Explorer & CMS (Week 12)
Goal: Geospatial search and editorial content.


Map Explorer:
□ Add PostGIS PointField to AbstractListing (lat/lng already there)
□ GET /api/v1/listings/nearby/?lat=&lng=&radius_km=&type= (PostGIS ST_DWithin)
□ Frontend: /explore/map/ page with Mapbox GL JS or Google Maps
□ Sidebar filters + map pin clustering

Travel Guide CMS:
□ Article model with rich body (store as JSON — use tiptap on frontend)
□ GET /api/v1/cms/articles/
□ GET /api/v1/cms/articles/{slug}/
□ Frontend: /travel-guide/ listing page
□ Frontend: /travel-guide/[slug]/ article page with SEO meta tags (Next.js generateMetadata)
□ Admin CMS editor under /admin/cms/articles/new/
Phase 7 — Reviews & Ratings (Week 13)

□ Review model (user → listing, post-stay only, one per booking)
□ POST /api/v1/listings/{type}/{slug}/reviews/
□ Celery task: send review request email 24h after checkout
□ Rating aggregation: update listing.rating_avg on each new review
□ Frontend: review cards on listing detail page, review form in booking history
Phase 8 — Performance & Production (Week 14–15)

□ Redis query caching for listing search results (cache.set with 5min TTL)
□ Next.js ISR for destination and listing detail pages (revalidate: 300)
□ Add Sentry to both frontend and backend (SENTRY_DSN already in env)
□ Add rate limiting: django-ratelimit on auth endpoints
□ Add pg_cron or Celery Beat schedule for: deal expiry, payout processing, rewards expiry
□ Switch from SQLite (dev) to confirm PostgreSQL is default in development.py
□ Load test booking concurrency with k6 or Locust
□ Security audit: CSRF on webhooks, SQL injection via ORM, JWT rotation