# AdoraTour — Cambodia Travel Super App
## Full Backend Architecture Plan (20,000 Users Scale)

> **Platform Vision:** A unified digital platform that aggregates hotels, homestays, tours, transportation, attractions, local guides, and travel services into one integrated booking ecosystem for travelers visiting Cambodia.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Tech Stack Decisions](#3-tech-stack-decisions)
4. [Backend Modules & Features](#4-backend-modules--features)
5. [Database Design](#5-database-design)
6. [API Structure](#6-api-structure)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Multi-tenancy Design](#8-multi-tenancy-design)
9. [Real-time Features](#9-real-time-features)
10. [Background Jobs & Queues](#10-background-jobs--queues)
11. [File Storage Strategy](#11-file-storage-strategy)
12. [Payment System](#12-payment-system)
13. [Analytics & Reporting](#13-analytics--reporting)
14. [Search & Price Comparison](#14-search--price-comparison)
15. [Security Architecture](#15-security-architecture)
16. [Scalability for 20k Users](#16-scalability-for-20k-users)
17. [Infrastructure & Deployment](#17-infrastructure--deployment)
18. [Monitoring & Observability](#18-monitoring--observability)
19. [Development Roadmap (Phases)](#19-development-roadmap-phases)

---

## 1. Executive Summary

**AdoraTour** is a full-scale Cambodia Travel Super App — a platform combining the power of an OTA (Online Travel Agency) with a Marketplace model. It serves:

- **Travelers (Foreign & Local)** — search, compare, book, pay, review
- **Hotel / Homestay Partners** — list properties, manage availability, receive bookings
- **Tour Operators** — publish packages, manage itineraries
- **Local Guides** — register profiles, accept bookings
- **Transportation Providers** — list vehicles, routes, schedules
- **Platform Admins** — manage all partners, approve listings, view analytics

**Target Scale:** 20,000 active users  
**Model:** SaaS B2B2C (partners pay subscription + commission; travelers pay for services)  
**Primary Region:** Cambodia  

---

## 2. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  Next.js 15  │  │  React Native /  │  │  Partner Dashboard  │  │
│  │  (Traveler   │  │  Flutter Mobile  │  │  (Next.js Admin UI) │  │
│  │   Web App)   │  │  App             │  │                     │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────┬──────────┘  │
└─────────┼───────────────────┼───────────────────────┼─────────────┘
          │                   │                        │
          ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / NGINX                         │
│   Rate Limiting | SSL Termination | Load Balancing | Routing        │
└─────────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  Django REST API    │      │  Django Channels           │
│  (DRF - HTTP/REST)  │      │  (WebSocket - Real-time)   │
│                     │      │                            │
│  /api/v1/...        │      │  ws://chat, notifications, │
│                     │      │  live availability         │
└────────┬────────────┘      └────────────┬───────────────┘
         │                                │
         ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                        │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Booking  │ │ Payment  │ │ Search   │ │ Notify   │ │
│  │  Service  │ │ Service  │ │ Service  │ │ Service  │ │
│  └───────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Review   │ │ Partner  │ │ Guide    │ │Analytics │ │
│  │  Service  │ │ Service  │ │ Service  │ │ Service  │ │
│  └───────────┘ └──────────┘ └──────────┘ └──────────┘ │
└────────────────────────────────────────────────────────┘
         │                   │               │
         ▼                   ▼               ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │  Redis Cache │   │  AWS S3      │
│  (Primary DB)│   │  + Pub/Sub   │   │  (Files)     │
└──────────────┘   └──────────────┘   └──────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Celery Workers               │
│  (Emails, Reports, Reminders) │
└──────────────────────────────┘
```

---

## 3. Tech Stack Decisions

### Backend Core

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Framework | Django | 5.x | Mature, batteries-included, fast development |
| REST API | Django REST Framework (DRF) | 3.15+ | Standard Python REST, superb documentation |
| Real-time | Django Channels | 4.x | WebSocket on Django, scales with Redis |
| Task Queue | Celery | 5.x | Async jobs, scheduled tasks |
| Message Broker | Redis | 7.x | Celery broker + Django Channels layer + cache |
| Database | PostgreSQL | 16.x | Best relational DB for Django, JSONB support |
| Object Storage | AWS S3 (or Cloudflare R2) | — | Media, documents, partner uploads |
| Search | PostgreSQL Full-Text + django-filter | — | Sufficient at 20k users; Elasticsearch later |
| Payments | Stripe + dj-stripe | — | Subscriptions + one-time bookings |
| Auth | SimpleJWT + django-allauth | — | JWT for API, social login optional |
| Email | Django + SendGrid / SES | — | Transactional emails |
| SMS | Twilio / AWS SNS | — | Booking confirmations |

### Frontend

| Layer | Technology | Reason |
|-------|-----------|--------|
| Web App | Next.js 15 (App Router) | Server components, SEO, TypeScript |
| UI System | Tailwind CSS + shadcn/ui | Fast, consistent, professional |
| Charts | Recharts / Tremor | Partner analytics dashboards |
| State | Zustand / React Query | API caching, server state |
| Maps | Mapbox GL / Google Maps JS | Location-based features |

### Mobile (Phase 2)

| Layer | Technology |
|-------|-----------|
| Cross-platform | React Native (Expo) |
| Same APIs as web | DRF REST + WebSocket channels |

### Infrastructure

| Layer | Technology |
|-------|-----------|
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (reverse proxy + static files) |
| WSGI Server | Gunicorn (HTTP) |
| ASGI Server | Daphne / Uvicorn (WebSocket) |
| CI/CD | GitHub Actions |
| Hosting (Phase 1) | Railway / Render / Fly.io |
| Hosting (Scale) | AWS EC2 + RDS + ElastiCache |

---

## 4. Backend Modules & Features

### Module 1 — User Management

```
users/
├── models.py          → CustomUser, UserProfile, TravelerProfile
├── roles.py           → SUPER_ADMIN, PARTNER_ADMIN, GUIDE, TRAVELER, STAFF
├── serializers.py
├── views.py
└── permissions.py
```

**Features:**
- Custom User model with role-based access
- JWT authentication (access + refresh tokens)
- Social login (Google, Facebook via allauth)
- Email verification on registration
- Password reset via email
- Profile management (avatar, bio, preferences, nationality)
- Document upload (passport, ID for partner KYC)
- User activity logs

---

### Module 2 — Partner Management (Hotels / Homestays / Tour Operators)

```
partners/
├── models.py          → Partner, PartnerBranch, PartnerDocument
├── onboarding.py      → Approval workflow
├── subscription.py    → Stripe plan management
└── views.py
```

**Features:**
- Partner registration & KYC workflow
- Admin approval before going live
- Multiple branches per partner (chain hotels)
- Subscription tiers: Basic / Pro / Enterprise
- Partner dashboard API endpoints
- Revenue analytics per partner
- Commission tracking

**Partner Tiers:**

| Tier | Monthly Fee | Max Listings | Commission | Features |
|------|------------|--------------|-----------|---------|
| Basic | $29 | 1 property | 12% | Standard listing |
| Pro | $79 | 5 properties | 10% | Analytics + Priority |
| Enterprise | $199 | Unlimited | 8% | API access + Dedicated support |

---

### Module 3 — Hotel & Homestay Module

```
accommodations/
├── models.py          → Property, RoomType, RoomInventory, Amenity, Photo
├── availability.py    → Calendar management
├── pricing.py         → Dynamic pricing, seasonal rates
└── views.py
```

**Models:**
- `Property` — name, type (hotel/homestay/villa/guesthouse), location, star_rating, coordinates
- `RoomType` — name, max_occupancy, base_price, bed_type
- `RoomInventory` — date, room_type, available_count, booked_count
- `PropertyPhoto` — photo, caption, is_primary, display_order
- `Amenity` — wifi, pool, parking, breakfast, ac (tag system)

**Features:**
- Property listing & search with filters
- Room availability calendar
- Dynamic pricing engine (weekday/weekend/season/event)
- Bulk availability update API (for partners)
- Google Maps integration for coordinates
- Nearby attractions tagging
- Photo gallery management (S3 upload)
- Property verification badge

---

### Module 4 — Tour Packages Module

```
tours/
├── models.py          → TourPackage, TourItinerary, TourDay, TourInclusion
├── slots.py           → TourSlot, TourParticipant
└── views.py
```

**Models:**
- `TourPackage` — title, description, duration_days, price, category, difficulty, min_group_size, max_group_size
- `TourItinerary` → `TourDay` → `DayActivity`
- `TourSlot` — start_date, available_seats, price_override, guide_assigned
- `TourInclusion` — what is included / excluded

**Features:**
- Create multi-day tour itineraries
- Set departure slots with seat limits
- Assign local guides to tour slots
- Group vs private tour pricing
- Tour category tags (Adventure, Cultural, Food, Nature, City)
- Featured/curated tours
- Tour difficulty levels

---

### Module 5 — Local Guides Module

```
guides/
├── models.py          → GuideProfile, GuideCertification, GuideLanguage
├── availability.py    → GuideCalendar
└── views.py
```

**Models:**
- `GuideProfile` — bio, languages, specializations, daily_rate, license_number
- `GuideCertification` — cert_type, issuing_authority, expiry_date, document
- `GuideCalendar` — date, is_available, booking (FK)
- `GuideReview` — rating, comment, traveler

**Features:**
- Guide registration and verification
- Language proficiency tagging
- Specialization (Angkor Wat, Phnom Penh history, food tours, adventure)
- Availability calendar management
- Direct booking by travelers
- Guide rating system
- Revenue tracking (per booking commission)

---

### Module 6 — Transportation Module

```
transportation/
├── models.py          → TransportProvider, Vehicle, Route, Schedule
├── booking.py         → TransportBooking
└── views.py
```

**Models:**
- `TransportProvider` — company_name, license, contact
- `Vehicle` — type (bus/van/tuk-tuk/car), capacity, plate_number, AC, photos
- `Route` — origin, destination, distance_km, duration_hours, route_type
- `Schedule` — route, departure_time, arrival_time, price, available_seats
- `TransportBooking` — schedule, passenger_count, pickup_point, dropoff_point

**Transport Types:**
- Airport transfers
- City-to-city buses / minivans
- Private car hire
- Tuk-tuk (short distance)
- Boat / ferry routes

---

### Module 7 — Booking Engine

```
bookings/
├── models.py          → Booking, BookingItem, BookingStatus
├── engine.py          → BookingEngine (availability check, lock, confirm)
├── cancellation.py    → CancellationPolicy
└── views.py
```

**Booking Flow:**

```
SEARCH → SELECT → LOCK (inventory) → PAYMENT → CONFIRM → EMAIL/SMS
                      ↓ (if payment fails)
                   RELEASE LOCK → AVAILABLE again
```

**Booking States:**
```
PENDING → AWAITING_PAYMENT → CONFIRMED → CHECKED_IN → COMPLETED → REVIEWED
                         ↘ PAYMENT_FAILED → CANCELLED
                                        → REFUNDED
```

**Models:**
- `Booking` — reference_number, user, total_price, currency, status, created_at
- `BookingItem` — booking, item_type (hotel/tour/guide/transport), item_id, check_in, check_out, quantity, unit_price
- `CancellationPolicy` — hours_before, refund_percentage

**Features:**
- Atomic inventory locking during checkout (PostgreSQL SELECT FOR UPDATE)
- Multi-item booking (hotel + tour + transport in one checkout)
- Booking reference number generation
- Cancellation with auto-refund
- Overbooking protection
- Guest booking (no account required)
- Booking modification window

---

### Module 8 — Payment Module

```
payments/
├── models.py          → Payment, Refund, PartnerPayout
├── stripe_handler.py  → Stripe integration
├── webhook.py         → Stripe webhook handler
└── views.py
```

**Payment Methods:**
- Credit/Debit Card (Stripe)
- ABA Pay / KHQR (Cambodia local — future phase)
- PayPal (for international travelers)
- Voucher / Promo code
- Platform credits

**Payment Flow:**
```
Frontend → Create PaymentIntent (backend) → Stripe
         ← client_secret ←
Frontend → Confirm payment (Stripe.js)
         → Stripe Webhook → backend confirms booking
```

**Payout Logic:**
- Partner receives payment minus platform commission
- Payouts processed on D+1 (day after checkout)
- Celery task handles automated payout scheduling

---

### Module 9 — Review & Rating System

```
reviews/
├── models.py          → Review, ReviewPhoto, ReviewVote
├── moderation.py      → ReviewModerator
└── views.py
```

**Models:**
- `Review` — booking (FK), rating (1–5), title, body, created_at, is_verified
- `ReviewCategory` — cleanliness, service, value, location, accuracy (sub-scores)
- `ReviewPhoto` — photo, caption
- `ReviewVote` — helpful / not helpful (user voting)
- `ReviewResponse` — partner response to review

**Features:**
- Only verified bookings can leave reviews
- 14-day review window after checkout
- Sub-category ratings
- Photo upload with review
- Partner response to reviews
- Review moderation (flag inappropriate)
- Aggregate rating calculation cached in Redis

---

### Module 10 — Price Comparison Engine

```
comparison/
├── aggregator.py      → PriceAggregator
├── cache.py           → Redis-cached results
└── views.py
```

**Features:**
- Search across all property types by date/location/budget
- Real-time availability + price aggregation
- Filter by: price range, star rating, amenities, distance from landmark
- Sort by: price (low-high), rating, popularity, newest
- Price calendar (cheapest dates visualization)
- Similar listings recommendation
- "Best value" badge algorithm

**Caching Strategy:**
```python
# Cache search results for 5 minutes in Redis
cache_key = f"search:{location}:{checkin}:{checkout}:{filters_hash}"
CACHE_TTL = 300  # 5 minutes
```

---

### Module 11 — Tourism Information Module

```
tourism/
├── models.py          → Attraction, Landmark, Province, LocalInfo
├── views.py
└── serializers.py
```

**Models:**
- `Attraction` — name, description, category, location, coordinates, opening_hours, entry_fee, photos
- `Province` — name, description, highlights, best_time_to_visit
- `TravelTip` — category, tip_text, author, published_at
- `EventCalendar` — event_name, date, location, description (Khmer New Year, Water Festival, etc.)

**Content Categories:**
- Historical sites (Angkor Wat, Phnom Penh, etc.)
- Natural attractions (Koh Rong, Tonle Sap, etc.)
- Cultural experiences
- Food & dining guides
- Safety & travel tips
- Visa & entry information

---

### Module 12 — Notification System

```
notifications/
├── models.py          → Notification, NotificationPreference
├── channels.py        → Email, SMS, Push, In-app
├── templates/         → Email HTML templates
└── tasks.py           → Celery notification tasks
```

**Notification Events:**
- Booking confirmation (Email + SMS)
- Booking reminder (24h before)
- Payment receipt
- Cancellation confirmation + refund status
- Review reminder (after checkout)
- Partner: new booking received
- Partner: payout processed
- Admin: new partner registration

**Channels:**
- In-app (stored in DB, delivered via WebSocket)
- Email (SendGrid / AWS SES)
- SMS (Twilio)
- Push (Firebase Cloud Messaging — Phase 2 mobile)

---

### Module 13 — Analytics Module

```
analytics/
├── models.py          → PageView, SearchEvent, BookingFunnel
├── reports.py         → ReportGenerator
├── tasks.py           → Daily/weekly report Celery tasks
└── views.py
```

**Platform Admin Analytics:**
- Total bookings per day/week/month
- Revenue by service type
- Top properties by booking volume
- User acquisition funnel
- Most searched destinations
- Conversion rate (search → booking)
- Partner performance ranking

**Partner Dashboard Analytics:**
- Booking calendar view
- Revenue by month (with export CSV)
- Occupancy rate per room type
- Review score trends
- Page views on their listing
- Comparison with category average

---

## 5. Database Design

### Core Tables Overview

```sql
-- Users
users (id, email, role, is_verified, created_at)
user_profiles (user_id, full_name, phone, nationality, avatar, bio)

-- Partners
partners (id, user_id, business_name, type, status, subscription_tier)
partner_branches (id, partner_id, branch_name, address, coordinates)

-- Accommodations
properties (id, partner_id, name, type, city, coordinates, star_rating, status)
room_types (id, property_id, name, max_occupancy, base_price)
room_inventory (id, room_type_id, date, available, booked)

-- Tours
tour_packages (id, partner_id, title, duration_days, base_price, category, status)
tour_slots (id, package_id, start_date, available_seats, price)
tour_itinerary_days (id, package_id, day_number, title, description)

-- Guides
guide_profiles (id, user_id, license_number, daily_rate, verified)
guide_languages (id, guide_id, language, level)
guide_availability (id, guide_id, date, is_available)

-- Transport
transport_routes (id, provider_id, origin, destination, duration_hours, price)
transport_schedules (id, route_id, departure_time, available_seats)

-- Bookings
bookings (id, user_id, reference_number, status, total_price, currency)
booking_items (id, booking_id, item_type, item_id, checkin, checkout, unit_price)

-- Payments
payments (id, booking_id, stripe_payment_intent_id, amount, status)
refunds (id, payment_id, amount, reason, status)

-- Reviews
reviews (id, booking_id, user_id, rating, body, is_verified)
review_categories (id, review_id, category, score)

-- Tourism Info
attractions (id, name, category, city, coordinates, description)
provinces (id, name, description)

-- Notifications
notifications (id, user_id, type, title, body, is_read, created_at)
```

### Indexes for Performance (20k users)

```sql
-- Booking lookups
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(reference_number);

-- Availability search (most frequent query)
CREATE INDEX idx_room_inventory_date ON room_inventory(date, room_type_id);
CREATE INDEX idx_tour_slots_date ON tour_slots(start_date, available_seats);

-- Search by location
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(type);

-- Reviews
CREATE INDEX idx_reviews_item ON reviews(item_type, item_id);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

---

## 6. API Structure

### Base URL: `/api/v1/`

### Authentication Endpoints
```
POST   /api/v1/auth/register/           → Register new user
POST   /api/v1/auth/login/              → Login (returns JWT tokens)
POST   /api/v1/auth/token/refresh/      → Refresh access token
POST   /api/v1/auth/logout/             → Logout (blacklist token)
POST   /api/v1/auth/password/reset/     → Request password reset
POST   /api/v1/auth/email/verify/       → Verify email
GET    /api/v1/auth/me/                 → Get current user profile
```

### Accommodation Endpoints
```
GET    /api/v1/accommodations/          → Search properties (filters, pagination)
GET    /api/v1/accommodations/{id}/     → Property detail
GET    /api/v1/accommodations/{id}/rooms/         → Room types
GET    /api/v1/accommodations/{id}/availability/  → Availability calendar
GET    /api/v1/accommodations/{id}/reviews/       → Reviews

# Partner-only
POST   /api/v1/partner/accommodations/        → Create property
PUT    /api/v1/partner/accommodations/{id}/   → Update property
POST   /api/v1/partner/accommodations/{id}/rooms/         → Add room type
PUT    /api/v1/partner/accommodations/{id}/availability/  → Update availability
```

### Tour Endpoints
```
GET    /api/v1/tours/                   → Search tours
GET    /api/v1/tours/{id}/              → Tour detail
GET    /api/v1/tours/{id}/slots/        → Available departure slots
POST   /api/v1/partner/tours/           → Create tour package
```

### Guide Endpoints
```
GET    /api/v1/guides/                  → Search available guides
GET    /api/v1/guides/{id}/             → Guide profile
GET    /api/v1/guides/{id}/availability/ → Guide calendar
POST   /api/v1/guides/register/         → Guide self-registration
```

### Transport Endpoints
```
GET    /api/v1/transport/routes/        → Search routes (origin → destination)
GET    /api/v1/transport/schedules/     → Schedules for route
POST   /api/v1/partner/transport/       → Add transport route
```

### Booking Endpoints
```
POST   /api/v1/bookings/                → Create booking
GET    /api/v1/bookings/                → My bookings list
GET    /api/v1/bookings/{ref}/          → Booking detail
POST   /api/v1/bookings/{ref}/cancel/   → Cancel booking
GET    /api/v1/partner/bookings/        → Partner bookings list
PUT    /api/v1/partner/bookings/{ref}/status/ → Update booking status
```

### Payment Endpoints
```
POST   /api/v1/payments/intent/         → Create Stripe PaymentIntent
POST   /api/v1/payments/confirm/        → Confirm payment success
GET    /api/v1/payments/{id}/           → Payment detail
POST   /api/v1/payments/webhook/        → Stripe webhook (public)
```

### Review Endpoints
```
POST   /api/v1/reviews/                 → Submit review (verified booking)
GET    /api/v1/reviews/{id}/            → Review detail
POST   /api/v1/reviews/{id}/response/   → Partner responds
POST   /api/v1/reviews/{id}/vote/       → Vote helpful/not
```

### Search & Compare
```
GET    /api/v1/search/                  → Universal search (all types)
GET    /api/v1/search/compare/          → Price comparison
GET    /api/v1/search/suggest/          → Autocomplete suggestions
```

### Notifications
```
GET    /api/v1/notifications/           → Get notifications
POST   /api/v1/notifications/read/      → Mark as read
DELETE /api/v1/notifications/{id}/      → Delete notification
```

### Analytics (Admin)
```
GET    /api/v1/admin/analytics/overview/      → Platform overview
GET    /api/v1/admin/analytics/bookings/      → Booking trends
GET    /api/v1/admin/analytics/revenue/       → Revenue breakdown
GET    /api/v1/partner/analytics/             → Partner-specific analytics
```

---

## 7. Authentication & Authorization

### JWT Token Strategy

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Role Hierarchy

```
SUPER_ADMIN
    └── PLATFORM_STAFF
            └── PARTNER_ADMIN
                    ├── PARTNER_STAFF
                    └── GUIDE
TRAVELER (end user)
GUEST (unauthenticated)
```

### Permission Classes

```python
# permissions.py
class IsSuperAdmin(BasePermission): ...
class IsPartnerAdmin(BasePermission): ...
class IsVerifiedTraveler(BasePermission): ...
class IsBookingOwner(BasePermission): ...
class IsGuide(BasePermission): ...

# Usage in views
class BookingViewSet(ModelViewSet):
    def get_permissions(self):
        if self.action == 'create':
            return [IsVerifiedTraveler()]
        elif self.action in ['update', 'partial_update']:
            return [IsPartnerAdmin()]
        return [IsAuthenticated()]
```

---

## 8. Multi-tenancy Design

AdoraTour uses a **row-level multi-tenancy** model where each partner's data is scoped by `partner_id`. This is sufficient at 20k users and simpler than schema-level tenancy.

### Pattern

```python
# All partner-owned models carry partner_id
class Property(models.Model):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE)
    ...

# QuerySet always filtered by partner context
class PartnerScopedQuerySet(models.QuerySet):
    def for_partner(self, user):
        return self.filter(partner__user=user)
```

### Partner Context Middleware

```python
class PartnerContextMiddleware:
    def __call__(self, request):
        if request.user.is_authenticated and request.user.role == 'PARTNER_ADMIN':
            request.partner = Partner.objects.get(user=request.user)
        return self.get_response(request)
```

---

## 9. Real-time Features

### Django Channels Setup

```python
# routing.py
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/<room_id>/", ChatConsumer.as_asgi()),
            path("ws/notifications/", NotificationConsumer.as_asgi()),
            path("ws/availability/<property_id>/", AvailabilityConsumer.as_asgi()),
        ])
    ),
})
```

### WebSocket Features

**1. In-app Notifications**
```
User connects → ws://adoratour.com/ws/notifications/
Server pushes: new_booking, payment_confirmed, message_received
```

**2. Partner ↔ Traveler Chat**
```
Both connect → ws://adoratour.com/ws/chat/{booking_ref}/
Messages stored in DB, delivered in real-time via Redis pub/sub
```

**3. Live Availability Updates**
```
Traveler on booking page → ws://adoratour.com/ws/availability/{property_id}/
When another booking occurs, all viewers see seat count update instantly
```

### Redis Channel Layers

```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [("redis", 6379)]},
    }
}
```

---

## 10. Background Jobs & Queues

### Celery Task Categories

```python
# tasks/emails.py
@shared_task(bind=True, max_retries=3)
def send_booking_confirmation_email(self, booking_id): ...

@shared_task
def send_review_reminder_email(booking_id): ...

# tasks/payments.py
@shared_task
def process_partner_payout(partner_id, period): ...

@shared_task
def retry_failed_payouts(): ...

# tasks/reports.py
@shared_task
def generate_partner_monthly_report(partner_id, month): ...

@shared_task
def generate_platform_daily_summary(): ...

# tasks/maintenance.py
@shared_task
def release_expired_booking_locks(): ...
@shared_task
def cleanup_expired_tokens(): ...
```

### Celery Beat Schedule (Cron Jobs)

```python
CELERY_BEAT_SCHEDULE = {
    # Every day at 8am: send booking reminders
    'send-booking-reminders': {
        'task': 'tasks.send_upcoming_booking_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    # Every day at midnight: release expired locks
    'release-expired-locks': {
        'task': 'tasks.release_expired_booking_locks',
        'schedule': crontab(minute=0),
    },
    # Every month on 1st: generate partner reports
    'monthly-partner-reports': {
        'task': 'tasks.generate_all_partner_monthly_reports',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),
    },
    # Every day: process partner payouts
    'daily-payouts': {
        'task': 'tasks.process_daily_payouts',
        'schedule': crontab(hour=10, minute=0),
    },
}
```

---

## 11. File Storage Strategy

### AWS S3 Structure

```
adoratour-media/
├── properties/
│   ├── {property_id}/
│   │   ├── main.jpg
│   │   ├── gallery/
│   │   │   ├── 001.jpg
│   │   │   └── 002.jpg
│   │   └── rooms/
│   │       └── {room_type_id}/
├── guides/
│   └── {guide_id}/
│       ├── profile.jpg
│       └── certifications/
├── tours/
│   └── {tour_id}/
│       └── gallery/
├── reviews/
│   └── {review_id}/
│       └── photos/
├── documents/
│   └── partners/
│       └── {partner_id}/
│           ├── business_license.pdf
│           └── id_document.pdf
└── static/
    └── (CSS, JS bundles - via CDN)
```

### Django Storage Configuration

```python
# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'adoratour-media'
AWS_S3_REGION_NAME = 'ap-southeast-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

# Image processing on upload (Pillow)
THUMBNAIL_SIZES = {
    'thumbnail': (150, 150),
    'medium': (400, 300),
    'large': (1200, 800),
}
```

---

## 12. Payment System

### Stripe Integration Architecture

```
Traveler selects items
        ↓
POST /api/v1/payments/intent/
    → Create PaymentIntent in Stripe
    → Lock inventory in DB (SELECT FOR UPDATE)
    → Return { client_secret }
        ↓
Frontend: stripe.confirmPayment(client_secret)
        ↓ (async)
Stripe Webhook → POST /api/v1/payments/webhook/
    → payment_intent.succeeded → confirm booking → send emails
    → payment_intent.payment_failed → release lock → notify user
```

### dj-stripe for Subscriptions (Partners)

```python
# Partner subscription plans created in Stripe
STRIPE_PLANS = {
    'basic': 'price_xxx_basic_monthly',
    'pro': 'price_xxx_pro_monthly',
    'enterprise': 'price_xxx_enterprise_monthly',
}

# Webhook events handled
DJSTRIPE_WEBHOOK_VALIDATION = 'verify_signature'
# customer.subscription.created
# customer.subscription.deleted
# invoice.payment_succeeded
# invoice.payment_failed
```

### Financial Security
- Idempotency keys on all Stripe API calls
- Webhook signature verification (Stripe-Signature header)
- Booking payment atomic transaction (DB + Stripe)
- All amounts stored as integers (cents/USD cents)
- Refund audit trail

---

## 13. Analytics & Reporting

### Data Collection

```python
# Lightweight event tracking (no external dependency needed)
class AnalyticsEvent(models.Model):
    event_type = models.CharField(max_length=50)  # search, view, booking, review
    user = models.ForeignKey(User, null=True)
    item_type = models.CharField(max_length=30)
    item_id = models.IntegerField()
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)
```

### Key Metrics

**Platform KPIs:**
- Gross Merchandise Value (GMV) = total bookings × price
- Take Rate = platform commission / GMV
- Monthly Active Users (MAU)
- Booking conversion rate
- Average Booking Value (ABV)
- Partner retention rate

**Partner KPIs:**
- Occupancy rate = booked nights / total nights
- Average Daily Rate (ADR)
- Revenue Per Available Room (RevPAR)
- Review score trend
- Page views to booking ratio

---

## 14. Search & Price Comparison

### Search Algorithm

```python
class PropertySearchService:
    def search(self, query_params: SearchQuery) -> QuerySet:
        qs = Property.objects.filter(
            status='ACTIVE',
            city__icontains=query_params.destination
        )

        # Availability filter (JOIN with inventory)
        qs = qs.filter(
            room_types__room_inventory__date__range=(
                query_params.checkin,
                query_params.checkout
            ),
            room_types__room_inventory__available_count__gt=0
        ).distinct()

        # Price filter
        if query_params.min_price:
            qs = qs.filter(room_types__base_price__gte=query_params.min_price)
        if query_params.max_price:
            qs = qs.filter(room_types__base_price__lte=query_params.max_price)

        # Amenity filter
        if query_params.amenities:
            for amenity in query_params.amenities:
                qs = qs.filter(amenities__slug=amenity)

        # Sorting
        if query_params.sort_by == 'price_asc':
            qs = qs.order_by('min_price')
        elif query_params.sort_by == 'rating':
            qs = qs.order_by('-average_rating')

        return qs
```

### Caching Strategy

```python
# Redis caching for search results (5-minute TTL)
def get_search_results(params):
    cache_key = generate_cache_key(params)
    result = cache.get(cache_key)
    if not result:
        result = PropertySearchService().search(params)
        cache.set(cache_key, result, timeout=300)
    return result

# Property detail caching (15 minutes)
@cache_page(60 * 15)
def property_detail(request, pk): ...

# Rating aggregates cached in Redis
def get_property_rating(property_id):
    cache_key = f"property:rating:{property_id}"
    ...
```

---

## 15. Security Architecture

### API Security

```python
# settings.py — Security hardening
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Rate limiting (django-ratelimit or django-rest-framework throttling)
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'auth': '10/minute',     # Login endpoint
        'search': '200/minute',  # Search endpoint
    }
}
```

### Input Validation

```python
# All user inputs validated via DRF Serializers
class BookingCreateSerializer(serializers.Serializer):
    checkin = serializers.DateField()
    checkout = serializers.DateField()
    guests = serializers.IntegerField(min_value=1, max_value=20)

    def validate(self, data):
        if data['checkout'] <= data['checkin']:
            raise serializers.ValidationError("Checkout must be after checkin")
        if (data['checkout'] - data['checkin']).days > 90:
            raise serializers.ValidationError("Booking cannot exceed 90 days")
        return data
```

### Security Checklist

- [x] JWT tokens with short expiry + refresh rotation
- [x] Token blacklisting on logout
- [x] HTTPS only (Nginx + Let's Encrypt)
- [x] Input validation on all endpoints
- [x] Parameterized queries (Django ORM — no raw SQL)
- [x] CORS whitelist (only allowed frontend domains)
- [x] Rate limiting on all endpoints
- [x] Stripe webhook signature verification
- [x] S3 bucket private (presigned URLs for access)
- [x] Partner KYC document access restricted
- [x] Admin endpoints require 2FA (Phase 2)
- [x] Audit logs for admin actions

---

## 16. Scalability for 20k Users

### Load Estimates

| Metric | Estimate |
|--------|---------|
| Registered users | 20,000 |
| Daily active users | ~4,000 (20%) |
| Peak concurrent users | ~800 |
| Daily API requests | ~200,000 |
| Daily searches | ~50,000 |
| Daily bookings | ~500 |
| Daily WebSocket connections | ~1,000 |

### Infrastructure Requirements

**At 20k users, a single server is sufficient with proper caching:**

| Component | Spec | Notes |
|-----------|------|-------|
| Django App Server | 4 vCPU, 8GB RAM | 4 Gunicorn workers |
| PostgreSQL | 4 vCPU, 16GB RAM | Primary DB + read replica |
| Redis | 2 vCPU, 4GB RAM | Cache + Channels + Celery broker |
| Celery Workers | 2 vCPU, 4GB RAM | 4 concurrent workers |
| Nginx | 2 vCPU, 2GB RAM | Reverse proxy |

### Optimization Strategies

**Database:**
```python
# Select related to avoid N+1 queries
properties = Property.objects.select_related('partner').prefetch_related(
    'room_types', 'photos', 'amenities'
)

# Database connection pooling
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 60,  # Keep connections for 60 seconds
        'OPTIONS': {'pool_size': 20, 'max_overflow': 40},
    }
}
```

**Caching Layers:**
```
Request → Nginx cache (static) → Redis cache → Django → PostgreSQL
```

**Query optimization:**
- Annotate aggregate fields (avg_rating, review_count) onto QuerySets
- Cache heavy analytics queries with 1-hour TTL
- Paginate all list endpoints (max 20 per page)
- Use `defer()` or `only()` for large models

---

## 17. Infrastructure & Deployment

### Production Architecture

```
                    ┌──────────────────────────────┐
                    │         Cloudflare CDN        │
                    │   (Static files, DDoS shield) │
                    └──────────────────────────────┘
                                   │
                    ┌──────────────────────────────┐
                    │         Nginx Server          │
                    │  SSL termination, rate limit  │
                    │  Port 80/443 → upstream       │
                    └───────────┬──────────────────┘
                                │
               ┌────────────────┼─────────────────┐
               ▼                ▼                  ▼
    ┌──────────────────┐ ┌─────────────┐ ┌────────────────┐
    │ Gunicorn (HTTP)  │ │   Daphne    │ │ Static Files   │
    │ Django REST API  │ │  (ASGI/WS)  │ │ /static/ /media│
    └──────────────────┘ └─────────────┘ └────────────────┘
               │                │
               └────────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │PostgreSQL│ │  Redis   │ │Celery Workers│
    │(primary) │ │Cache+Pub │ │+ Beat        │
    └──────────┘ └──────────┘ └──────────────┘
```

### Environment Variables

```bash
# .env.production
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=adoratour.com,www.adoratour.com

DATABASE_URL=postgres://user:password@db:5432/adoratour_db
REDIS_URL=redis://redis:6379/0

AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=adoratour-media
AWS_S3_REGION_NAME=ap-southeast-1

STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

SENDGRID_API_KEY=SG.xxx
DEFAULT_FROM_EMAIL=noreply@adoratour.com

TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890

CORS_ALLOWED_ORIGINS=https://adoratour.com,https://www.adoratour.com
FRONTEND_URL=https://adoratour.com
```

---

## 18. Monitoring & Observability

### Error Tracking

```python
# Sentry integration
import sentry_sdk
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    traces_sample_rate=0.1,  # 10% of requests traced
    environment='production',
)
```

### Health Check Endpoints

```python
# /api/v1/health/
{
    "status": "ok",
    "database": "connected",
    "redis": "connected",
    "celery": "running",
    "version": "1.0.0"
}
```

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/adoratour/django.log',
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
        },
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django': {'handlers': ['file', 'console'], 'level': 'WARNING'},
        'adoratour': {'handlers': ['file', 'console'], 'level': 'INFO'},
        'celery': {'handlers': ['file'], 'level': 'INFO'},
    },
}
```

### Uptime Monitoring
- **UptimeRobot** or **Better Uptime** — ping every 5 minutes
- Alert on: API response time > 3 seconds, error rate > 1%
- Celery queue depth alert if > 1000 pending tasks

---

## 19. Development Roadmap (Phases)

### Phase 1 — MVP (Months 1–3)

**Goal: Working booking platform for hotels + tours**

- [ ] User registration, login, JWT auth
- [ ] Hotel/Homestay listing (partner creates via API)
- [ ] Room availability & pricing
- [ ] Basic search & filters
- [ ] Booking creation + Stripe payment
- [ ] Email confirmation
- [ ] Partner dashboard (bookings view)
- [ ] Admin panel (Django admin + custom)
- [ ] Docker deployment on Railway/Render

**Team:** 1-2 backend devs + 1 frontend dev

---

### Phase 2 — Full Platform (Months 4–6)

**Goal: Full marketplace with all service types**

- [ ] Tour packages + departure slots
- [ ] Local guide module + booking
- [ ] Transportation routes + booking
- [ ] Tourism information pages
- [ ] Review & rating system
- [ ] Price comparison engine
- [ ] Partner analytics dashboard
- [ ] In-app notifications (WebSocket)
- [ ] SMS notifications (Twilio)
- [ ] Partner onboarding workflow

---

### Phase 3 — Growth Features (Months 7–9)

**Goal: Retention, engagement, scale**

- [ ] Traveler ↔ Partner chat (WebSocket)
- [ ] Promo codes & discounts system
- [ ] Loyalty points program
- [ ] Social login (Google, Facebook)
- [ ] Mobile app (React Native)
- [ ] Multi-language support (EN, KH, ZH)
- [ ] Multi-currency support (USD, KHR)
- [ ] Advanced analytics (cohort, funnel)
- [ ] API access for Enterprise partners

---

### Phase 4 — Scale (Month 10+)

**Goal: Handle 100k+ users**

- [ ] Migrate to AWS (EC2 + RDS + ElastiCache)
- [ ] Database read replicas
- [ ] Elasticsearch for advanced search
- [ ] CDN for all media (CloudFront)
- [ ] Horizontal scaling (multiple app servers)
- [ ] Payment: Add ABA Pay / KHQR
- [ ] B2B API (travel agencies)
- [ ] White-label option for partner brands

---

## Project Folder Structure

```
adoratour-backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/
│   ├── partners/
│   ├── accommodations/
│   ├── tours/
│   ├── guides/
│   ├── transportation/
│   ├── bookings/
│   ├── payments/
│   ├── reviews/
│   ├── tourism/
│   ├── notifications/
│   └── analytics/
├── common/
│   ├── mixins.py
│   ├── permissions.py
│   ├── pagination.py
│   ├── exceptions.py
│   └── utils.py
├── tasks/
│   ├── emails.py
│   ├── payments.py
│   ├── reports.py
│   └── maintenance.py
├── tests/
│   ├── test_bookings.py
│   ├── test_payments.py
│   └── test_search.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   └── entrypoint.sh
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
└── manage.py
```

---

*AdoraTour Backend Architecture — Version 1.0*  
*Designed for 20,000 active users with clear upgrade path to 100,000+*  
*Cambodia Travel Super App — Built with Django 5.x + DRF + PostgreSQL + Redis*
