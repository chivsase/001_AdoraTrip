# AdoraTrip — Cambodia Travel Super App
## Full Backend Architecture (20,000 Users Scale)

> **Platform Vision:** A unified digital platform that aggregates hotels, homestays, tours, transportation, attractions, local guides, and travel services into one integrated booking ecosystem for travelers visiting Cambodia.
>
> **Document Status:** Reflects the actual implemented state as of April 2026, plus forward-looking design for phases 2–4.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure (Actual)](#4-project-structure-actual)
5. [Identity & Auth System (Implemented)](#5-identity--auth-system-implemented)
6. [RBAC — Role-Based Access Control (Implemented)](#6-rbac--role-based-access-control-implemented)
7. [Organization & Multi-tenancy (Implemented)](#7-organization--multi-tenancy-implemented)
8. [API Endpoints (Implemented)](#8-api-endpoints-implemented)
9. [Security Architecture (Implemented)](#9-security-architecture-implemented)
10. [Background Jobs & Celery (Implemented)](#10-background-jobs--celery-implemented)
11. [Backend Modules — Planned](#11-backend-modules--planned)
12. [Database Design](#12-database-design)
13. [Real-time Features](#13-real-time-features)
14. [Payment System](#14-payment-system)
15. [Search & Price Comparison](#15-search--price-comparison)
16. [File Storage Strategy](#16-file-storage-strategy)
17. [Analytics & Reporting](#17-analytics--reporting)
18. [Scalability for 20k Users](#18-scalability-for-20k-users)
19. [Infrastructure & Deployment](#19-infrastructure--deployment)
20. [Monitoring & Observability](#20-monitoring--observability)
21. [Development Roadmap (Phases)](#21-development-roadmap-phases)

---

## 1. Executive Summary

**AdoraTrip** is a full-scale Cambodia Travel Super App — combining an OTA (Online Travel Agency) with a Marketplace model. It serves:

| User Type | Role | Access |
|-----------|------|--------|
| Travelers (Foreign & Local) | Search, compare, book, pay, review | Public search → authenticated booking |
| Hotel / Homestay Partners | List properties, manage availability | Organization member → OWNER/MANAGER/STAFF/FINANCE |
| Tour Operators | Publish packages, manage itineraries | Organization member |
| Local Guides | Register profiles, accept bookings | LOCAL_GUIDE platform role |
| Transportation Providers | List vehicles, routes, schedules | TRANSPORT_PROVIDER platform role |
| Platform Admins | Manage partners, approve listings | SUPER_ADMIN / PLATFORM_STAFF |

**Target Scale:** 20,000 active users
**Model:** SaaS B2B2C — partners pay subscription + commission; travelers pay for services
**Primary Region:** Cambodia (UTC+7, Khmer/English/Chinese)

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│  │  Next.js 15  │  │  React Native /  │  │  Partner Dashboard  │   │
│  │  (Traveler   │  │  Flutter Mobile  │  │  (Next.js Admin UI) │   │
│  │   Web App)   │  │  App [Phase 3]   │  │  [Phase 2]          │   │
│  └──────┬───────┘  └────────┬─────────┘  └──────────┬──────────┘   │
└─────────┼───────────────────┼───────────────────────┼──────────────┘
          │ HTTPS             │ HTTPS                  │ HTTPS
          ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NGINX — API Gateway                             │
│  Rate Limiting (auth 10/min, api 100/min, search 200/min)          │
│  SSL Termination | Load Balancing | Static File Serving            │
└─────────────────────────────────────────────────────────────────────┘
          │ HTTP/1.1                      │ WebSocket
          ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  Gunicorn + Django  │      │  Daphne + Django Channels │
│  (REST API — DRF)  │      │  (WebSocket Real-time)    │
│  /api/v1/...        │      │  ws://notifications/      │
│                     │      │  ws://chat/{booking}/     │
└────────┬────────────┘      └────────────┬───────────────┘
         │                                │
         ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                 DATA & MESSAGING LAYER                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3     │  │
│  │  (Primary DB)│  │  Cache +     │  │  Media Files │  │
│  │  SQLite(dev) │  │  Pub/Sub +   │  │  Documents   │  │
│  │              │  │  Celery Bkr  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│           Celery Workers + Beat             │
│  Queue: emails | payments | reports        │
│  Schedule: reminders, payouts, reports     │
└────────────────────────────────────────────┘
```

---

## 3. Tech Stack

### Implemented (Phase 1 — Auth + Org Foundation)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Django | 5.1.4 | `config/settings/` split (base/dev/prod) |
| REST API | Django REST Framework | 3.15.2 | Custom JWT auth class |
| Auth | djangorestframework-simplejwt | 5.4.0 | Access 60min + Refresh 30d + blacklist |
| Social Auth | django-allauth | 65.3.0 | Google OAuth2 + Facebook OAuth2 |
| Brute Force | django-axes | 7.0.1 | 5 failures → 1h lockout; DB handler (dev) |
| Task Queue | Celery | 5.4.0 | CELERY_TASK_ALWAYS_EAGER=True in dev |
| Task Broker | Redis | — | `redis://localhost:6379/0` |
| Beat Scheduler | django-celery-beat | 2.7.0 | DB-backed schedule |
| CORS | django-cors-headers | 4.6.0 | CORS_ALLOW_CREDENTIALS=True |
| Filtering | django-filter | 24.3 | Search + filter backends on DRF |
| API Docs | drf-spectacular | 0.28.0 | `/api/docs/` (Swagger UI) |
| Settings | python-decouple | 3.8 | `.env` file + environment vars |
| Database (dev) | SQLite | — | `db.sqlite3` |
| Database (prod) | PostgreSQL | 16.x | via `psycopg2-binary + dj-database-url` |

### Planned (Phases 2–4)

| Layer | Technology | Phase |
|-------|-----------|-------|
| Real-time | Django Channels 4.x + Daphne | 2 |
| Channel Layer | channels-redis | 2 |
| Storage | AWS S3 + django-storages + Pillow | 2 |
| Payments | Stripe + dj-stripe | 2 |
| SMS | Twilio / AWS SNS | 2 |
| Search | PostgreSQL Full-Text → Elasticsearch | 2/4 |
| Mobile | React Native (Expo) | 3 |
| CDN | Cloudflare / CloudFront | 4 |

---

## 4. Project Structure (Actual)

```
AdoraTrip/
├── config/                          # ← Replaces adoratrip_api/settings.py
│   ├── __init__.py                  # Imports celery_app at startup (critical for eager tasks)
│   ├── celery.py                    # Celery app instance
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # All shared settings
│   │   ├── development.py           # SQLite, console email, ALWAYS_EAGER, no Redis
│   │   └── production.py            # PostgreSQL, Redis, SendGrid, Sentry, HTTPS
│   ├── urls.py                      # Root URL config
│   ├── wsgi.py
│   └── asgi.py
│
├── users/                           # ← Identity & Auth app (fully implemented)
│   ├── models.py                    # CustomUser, EmailVerificationToken, PasswordResetToken, AuditLog
│   ├── managers.py                  # CustomUserManager (create_user, create_superuser)
│   ├── authentication.py            # CustomJWTAuthentication — Redis jti invalidation check
│   ├── serializers.py               # Register, Login (custom claims), Profile, Password flows
│   ├── views.py                     # All auth endpoints + admin user management
│   ├── urls.py                      # 14 URL patterns mounted at /api/v1/auth/
│   ├── permissions.py               # IsAuthenticatedAndVerified → IsSuperAdmin, IsPlatformStaff, etc.
│   ├── adapters.py                  # CustomAccountAdapter + CustomSocialAccountAdapter (allauth)
│   ├── middleware.py                # OrgContextMiddleware + AuditLogMiddleware
│   ├── signals.py                   # google_linked / facebook_linked flags via allauth signals
│   ├── tasks.py                     # send_verification_email, send_password_reset_email, create_audit_log
│   ├── throttles.py                 # AuthLoginThrottle, AuthRegisterThrottle, PasswordResetThrottle, etc.
│   ├── tokens.py                    # generate_secure_token helper
│   └── admin.py                     # CustomUserAdmin, AuditLogAdmin (read-only)
│
├── organizations/                   # ← RBAC multi-tenancy app (fully implemented)
│   ├── models.py                    # Organization, OrganizationMembership, OrganizationInvitation
│   ├── serializers.py               # Org CRUD, Membership, Invitation, Admin serializers
│   ├── views.py                     # Org CRUD + Member management + Admin approval
│   ├── urls.py                      # 11 URL patterns mounted at /api/v1/organizations/
│   ├── permissions.py               # IsOrgMember, IsOrgOwner, IsOrgManager, IsOrgStaff, IsOrgFinance
│   ├── signals.py                   # Auto-recalculate platform_role on membership change
│   ├── tasks.py                     # send_invitation_email
│   └── admin.py                     # OrganizationAdmin, MembershipAdmin, InvitationAdmin
│
├── api/                             # ← Tour & Booking MVP models (partially implemented)
│   ├── models.py                    # Tour (org FK), Booking (user FK + org FK)
│   ├── serializers.py               # Tour + Booking serializers
│   ├── views.py                     # TourViewSet + BookingViewSet (permission-scoped)
│   ├── urls.py                      # /api/v1/tours/, /api/v1/bookings/
│   └── admin.py
│
├── requirements/
│   ├── base.txt                     # All runtime dependencies
│   ├── development.txt              # dev extras (debug toolbar, etc.)
│   └── production.txt
│
├── docker/
│   ├── nginx/nginx.conf             # Rate limit zones, WebSocket proxy, admin IP restrict
│   └── entrypoint.sh
│
├── docker-compose.yml               # db, redis, api, websocket, celery_worker, celery_beat, flower, nginx
├── docker-compose.prod.yml
├── Dockerfile                       # Multi-stage: base → development → production
├── manage.py                        # DJANGO_SETTINGS_MODULE=config.settings.development
└── db.sqlite3                       # Development database
```

---

## 5. Identity & Auth System (Implemented)

### CustomUser Model

```python
# users/models.py

class PlatformRole(models.TextChoices):
    SUPER_ADMIN        = 'SUPER_ADMIN'        # Full platform control
    PLATFORM_STAFF     = 'PLATFORM_STAFF'     # Support & moderation
    PARTNER_OWNER      = 'PARTNER_OWNER'      # Org creator, full org access
    PARTNER_MANAGER    = 'PARTNER_MANAGER'    # Bookings, inventory, pricing
    PARTNER_STAFF      = 'PARTNER_STAFF'      # View bookings, check-in ops
    PARTNER_FINANCE    = 'PARTNER_FINANCE'    # Revenue reports only
    LOCAL_GUIDE        = 'LOCAL_GUIDE'        # Guide profile + bookings
    TRANSPORT_PROVIDER = 'TRANSPORT_PROVIDER' # Transport listings
    TRAVELER           = 'TRAVELER'           # Default — browse & book

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id              = UUIDField(primary_key=True)   # UUID prevents enumeration
    email           = EmailField(unique=True)         # USERNAME_FIELD
    full_name       = CharField(max_length=150)
    phone           = CharField(max_length=20)
    avatar          = ImageField(upload_to='avatars/')
    platform_role   = CharField(choices=PlatformRole, default=TRAVELER)
    is_active       = BooleanField(default=True)
    is_staff        = BooleanField(default=False)    # Django admin
    is_email_verified  = BooleanField(default=False)
    is_phone_verified  = BooleanField(default=False)
    google_linked   = BooleanField(default=False)
    facebook_linked = BooleanField(default=False)
    last_login_ip   = GenericIPAddressField(null=True)
    date_joined     = DateTimeField(default=timezone.now)
```

### JWT Token Architecture

```
┌─────────────────────────────────────────────────┐
│  Access Token (60 min)  — returned in JSON body  │
│  Stored in: JS memory (Zustand store)            │
│                                                  │
│  Claims:                                         │
│    sub              = user UUID                  │
│    email            = user email                 │
│    full_name        = display name               │
│    platform_role    = TRAVELER | PARTNER_OWNER…  │
│    is_email_verified = true | false              │
│    org_memberships  = [{org_id, slug, role}…]    │
│    iat              = issued-at timestamp         │
│    jti              = unique token ID            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Refresh Token (30 days) — HttpOnly cookie       │
│  Cookie: adoratrip_refresh                       │
│  SameSite=Lax | HttpOnly=True | Secure (prod)    │
│                                                  │
│  Rotation: each /token/refresh/ invalidates old  │
│  Blacklist: stored in DB (simplejwt_blacklist)   │
└─────────────────────────────────────────────────┘
```

### JWT Invalidation (All-Devices Logout)

```python
# users/authentication.py

class CustomJWTAuthentication(JWTAuthentication):
    """
    Extends simplejwt: after signature/expiry check, verifies the token's
    iat (issued-at) against a Redis key. If iat < stored timestamp → 401.
    Used to instantly invalidate all tokens on password reset or account suspension.
    """

    def get_user(self, validated_token):
        user_id = str(validated_token['sub'])
        redis_key = f'user_token_invalidation:{user_id}'
        invalidated_at = cache.get(redis_key)
        if invalidated_at:
            token_iat = validated_token['iat']
            if token_iat < invalidated_at:
                raise AuthenticationFailed('Token has been invalidated.')
        return super().get_user(validated_token)

    @classmethod
    def invalidate_user_tokens(cls, user_id: str):
        """Call on password reset, account suspension, or forced logout."""
        cache.set(
            f'user_token_invalidation:{user_id}',
            int(timezone.now().timestamp()),
            timeout=30 * 24 * 3600,  # 30 days (matches refresh token lifetime)
        )
```

### Email Verification & Password Reset

```
Email Verification Flow:
  POST /register/ → user created (is_email_verified=False)
                 → Celery: send_verification_email.delay(user_id)
                 → Token: EmailVerificationToken (24h TTL, secrets.token_urlsafe(32))
                 → Email: {FRONTEND_URL}/verify-email?token=XYZ
  POST /email/verify/ { token } → is_email_verified=True → fresh JWT returned

Password Reset Flow:
  POST /password/reset/request/ { email } → always 200 (no user enumeration)
                                          → Celery: send_password_reset_email.delay(user_id)
                                          → Token: PasswordResetToken (1h TTL)
  POST /password/reset/confirm/ { token, new_password }
       → validates token, sets password, marks is_used=True
       → CustomJWTAuthentication.invalidate_user_tokens(user_id) — all devices
```

### Social Login (Google OAuth2 + Facebook OAuth2)

```
GET  /accounts/google/login/         → django-allauth builds consent URL (PKCE)
                                     → 302 → accounts.google.com
GET  /accounts/google/login/callback/ → allauth exchanges code
                                      → CustomSocialAccountAdapter.pre_social_login()
                                        auto-links if email matches existing user
                                      → is_email_verified = True
                                      → google_linked = True (via signal)
                                      → issue JWT → redirect frontend
```

**SSO (SAML/OIDC):** Deferred. At 20k Cambodian SMBs (hotels, guides, operators), zero enterprise customers need corporate IdP (Azure AD, Okta). Extension points are in place: `CustomSocialAccountAdapter` and `OrganizationMembership.permission_overrides` JSONField.

---

## 6. RBAC — Role-Based Access Control (Implemented)

### Platform-Level Permissions

```python
# users/permissions.py

IsAuthenticatedAndVerified          # is_authenticated + is_email_verified + is_active
  ├── IsSuperAdmin                  # platform_role == SUPER_ADMIN
  ├── IsPlatformStaff               # platform_role in [SUPER_ADMIN, PLATFORM_STAFF]
  ├── IsAnyPartnerRole              # platform_role startswith 'PARTNER_'
  ├── IsLocalGuide                  # platform_role == LOCAL_GUIDE
  ├── IsTransportProvider           # platform_role == TRANSPORT_PROVIDER
  ├── IsTraveler                    # platform_role == TRAVELER
  └── IsBookingOwner                # obj-level: booking.user_id == request.user.id
```

### Organization-Level Permissions

```python
# organizations/permissions.py

IsOrgMember(IsAuthenticatedAndVerified)
  # Queries OrganizationMembership.objects.filter(user=request.user, organization=obj, is_active=True)
  ├── IsOrgOwner          required_roles = [OWNER]
  ├── IsOrgManager        required_roles = [OWNER, MANAGER]
  ├── IsOrgStaff          required_roles = [OWNER, MANAGER, STAFF]
  ├── IsOrgFinance        required_roles = [OWNER, FINANCE]
  └── IsOrgOwnerOrSuperAdmin  bypasses org check for SUPER_ADMIN
```

### Permission Matrix

| Action | SUPER_ADMIN | PLATFORM_STAFF | ORG OWNER | ORG MANAGER | ORG STAFF | ORG FINANCE | TRAVELER |
|--------|:-----------:|:--------------:|:---------:|:-----------:|:---------:|:-----------:|:--------:|
| Approve / reject orgs | Y | N | N | N | N | N | N |
| Create org | Y | N | — | — | — | — | Y* |
| Update org profile | Y | N | Y | N | N | N | N |
| Invite member | Y | N | Y | N | N | N | N |
| Remove member | Y | N | Y | N | N | N | N |
| Change member role | Y | N | Y | N | N | N | N |
| View org bookings | Y | Y | Y | Y | Y (own) | N | N |
| Manage pricing/inventory | Y | N | Y | Y | N | N | N |
| Revenue reports | Y | Y | Y | N | N | Y | N |
| Create/update tours | Y | N | Y | Y | N | N | N |
| Traveler bookings | Y | Y (read) | N | N | N | N | Y (own) |
| Public search | Y | Y | Y | Y | Y | Y | Y |

\* Creating an org auto-promotes platform_role TRAVELER → PARTNER_OWNER via signal

---

## 7. Organization & Multi-tenancy (Implemented)

### Data Model

```python
# organizations/models.py

class Organization:
    id                = UUIDField(pk)
    name              = CharField(200)
    slug              = SlugField(unique=True)        # /partner/hotel-a/
    org_type          = HOTEL | HOMESTAY | TOUR_OPERATOR | TRANSPORT | ATTRACTION | RESTAURANT | TRAVEL_AGENCY
    status            = PENDING | ACTIVE | SUSPENDED | REJECTED
    business_email    = EmailField()
    business_phone    = CharField()
    address, city     = TextField, CharField()
    registration_no   = CharField()                  # KYC
    tax_id            = CharField()
    created_by        = FK(CustomUser)
    subscription_tier = BASIC | PRO | ENTERPRISE
    rejection_reason  = TextField()

class OrganizationMembership:
    id                   = UUIDField(pk)
    user                 = FK(CustomUser)
    organization         = FK(Organization)
    role                 = OWNER | MANAGER | STAFF | FINANCE
    is_active            = BooleanField()
    invited_by           = FK(CustomUser, null=True)
    accepted_at          = DateTimeField(null=True)
    permission_overrides = JSONField()  # fine-grained per-member overrides
    unique_together: (user, organization)

class OrganizationInvitation:
    id           = UUIDField(pk)
    organization = FK(Organization)
    email        = EmailField()
    role         = OrgRole
    token        = CharField(64, unique=True)  # secrets.token_urlsafe(32)
    invited_by   = FK(CustomUser)
    is_accepted  = BooleanField()
    expires_at   = DateTimeField()             # now() + 7 days
```

### OrgContextMiddleware

Attaches `request.org` and `request.org_role` from the `X-Organization-Id` header. If user belongs to exactly one org, auto-selects it without the header.

```python
# users/middleware.py
class OrgContextMiddleware:
    # Single org → auto-attach
    # Multiple orgs → read X-Organization-Id header
    # Sets request.org (Organization) + request.org_role (str)
```

### Platform Role Auto-Sync Signal

When a membership is created/modified, `_recalculate_platform_role(user)` runs and updates `user.platform_role` based on highest-priority active membership:

```
OWNER   → PARTNER_OWNER
MANAGER → PARTNER_MANAGER
FINANCE → PARTNER_FINANCE
STAFF   → PARTNER_STAFF
(none)  → TRAVELER
```

### Partner Subscription Tiers

| Tier | Monthly Fee | Max Listings | Commission | Features |
|------|------------|--------------|-----------|---------|
| BASIC | $29 | 1 property | 12% | Standard listing |
| PRO | $79 | 5 properties | 10% | Analytics + Priority |
| ENTERPRISE | $199 | Unlimited | 8% | API access + Dedicated support |

---

## 8. API Endpoints (Implemented)

### Auth — `/api/v1/auth/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `csrf/` | AllowAny | Set CSRF cookie (call on app load) |
| POST | `register/` | AllowAny | Create traveler account + JWT |
| POST | `login/` | AllowAny | Email+password → JWT. Throttle: 10/min |
| POST | `logout/` | IsAuthenticated | Blacklist refresh token, clear cookie |
| POST | `token/refresh/` | Cookie | Rotate refresh → new access + refresh |
| POST | `token/verify/` | — | Verify access token validity |
| GET | `me/` | IsAuthenticatedAndVerified | Profile + org memberships |
| PATCH | `me/` | IsAuthenticatedAndVerified | Update full_name, phone, avatar |
| DELETE | `me/` | IsAuthenticatedAndVerified | Soft-delete account (GDPR) |
| POST | `email/verify/` | AllowAny | Consume token → is_email_verified=True |
| POST | `email/resend-verification/` | IsAuthenticated | Resend email (1/5 min throttle) |
| POST | `password/reset/request/` | AllowAny | Request reset (always 200) |
| POST | `password/reset/confirm/` | AllowAny | Consume token, set new password |
| POST | `password/change/` | IsAuthenticatedAndVerified | Change password (requires current) |
| GET | `admin/users/` | IsPlatformStaff | List users with search + role filter |
| PATCH | `admin/users/<uuid>/` | IsSuperAdmin | Update platform_role, is_active |

Social login routes are handled by django-allauth at `/accounts/google/login/`, `/accounts/facebook/login/`.

### Organizations — `/api/v1/organizations/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| POST | `/` | IsAuthenticatedAndVerified | Register org (status=PENDING) |
| GET | `mine/` | IsAuthenticatedAndVerified | My org memberships |
| GET | `<org_id>/` | IsOrgMember | Org detail |
| PATCH | `<org_id>/` | IsOrgOwnerOrSuperAdmin | Update org profile |
| GET | `<org_id>/members/` | IsOrgManager | List members + roles |
| POST | `<org_id>/members/invite/` | IsOrgOwner | Send invitation email |
| DELETE | `<org_id>/members/<user_id>/` | IsOrgOwner | Remove member |
| PATCH | `<org_id>/members/<user_id>/role/` | IsOrgOwner | Change member role |
| POST | `invitations/<token>/accept/` | AllowAny | Accept magic-link invite |
| GET | `admin/` | IsPlatformStaff | List all orgs with status filter |
| POST | `admin/<org_id>/approve/` | IsSuperAdmin | Approve org → ACTIVE |
| POST | `admin/<org_id>/suspend/` | IsSuperAdmin | Suspend org |
| POST | `admin/<org_id>/reject/` | IsSuperAdmin | Reject with reason |

### Tours & Bookings — `/api/v1/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `tours/` | AllowAny | List / search tours |
| POST | `tours/` | IsOrgStaff | Create tour (sets organization) |
| GET | `tours/<id>/` | AllowAny | Tour detail |
| PATCH/DELETE | `tours/<id>/` | IsOrgStaff | Update / delete |
| GET | `bookings/` | IsAuthenticated | My bookings (scoped by org or user) |
| POST | `bookings/` | IsAuthenticatedAndVerified | Create booking |
| GET | `bookings/<id>/` | IsAuthenticated | Booking detail |

### API Documentation

- `GET /api/schema/` — OpenAPI 3 schema (drf-spectacular)
- `GET /api/docs/` — Swagger UI

---

## 9. Security Architecture (Implemented)

### Brute Force Protection (django-axes)

```python
AXES_FAILURE_LIMIT   = 5          # 5 bad login attempts
AXES_COOLOFF_TIME    = timedelta(hours=1)
AXES_LOCKOUT_PARAMETERS = [['ip_address', 'username']]  # lock by IP + email
AXES_RESET_ON_SUCCESS   = True    # reset counter on successful login
# Dev:  AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'
# Prod: AXES_HANDLER = 'axes.handlers.cache.AxesCacheHandler' (Redis DB 1)
```

### Throttle Rates (DRF)

```python
DEFAULT_THROTTLE_RATES = {
    'anon':           '60/min',     # anonymous API calls
    'user':           '300/min',    # authenticated users
    'auth_login':     '10/min',     # login endpoint
    'auth_register':  '5/min',      # registration
    'password_reset': '3/min',      # password reset request
    'token_refresh':  '30/min',     # token refresh
    'resend_verify':  '1/5min',     # verification email resend
}
```

### Middleware Order (Critical)

```
SecurityMiddleware
CorsMiddleware             ← must be before CommonMiddleware
SessionMiddleware
CommonMiddleware
CsrfViewMiddleware
AuthenticationMiddleware
AccountMiddleware          ← allauth, after Auth
AxesMiddleware             ← brute force, after Auth
MessageMiddleware
XFrameOptionsMiddleware
OrgContextMiddleware       ← attach org to request
AuditLogMiddleware         ← log mutating auth/org calls
```

### CORS & CSRF

```python
CORS_ALLOW_CREDENTIALS = True      # required for HttpOnly cookie
CORS_ALLOW_HEADERS = [
    'authorization', 'content-type', 'x-csrftoken',
    'x-organization-id',            # org context header
    ...
]
CSRF_COOKIE_HTTPONLY = False        # Next.js must read it for X-CSRFToken header
```

### Security Checklist

- [x] JWT access token in JS memory (not localStorage)
- [x] Refresh token in HttpOnly; Secure; SameSite=Lax cookie
- [x] Token rotation + blacklisting on every refresh
- [x] All-devices logout via Redis `user_token_invalidation` key
- [x] UUID primary keys on User and all org models (prevents enumeration)
- [x] `sub` claim uses UUID not sequential int
- [x] HTTPS-only (Nginx + Let's Encrypt in production)
- [x] CORS whitelist — only allowed frontend domains
- [x] Brute force lockout (axes) — 5 failures → 1h cooldown
- [x] Named throttle scopes per endpoint type
- [x] Django ORM — no raw SQL, parameterized queries throughout
- [x] Password minimum 8 chars + common password + numeric validators
- [x] Anti-enumeration: password reset always returns 200
- [x] Email verification required before booking (IsAuthenticatedAndVerified)
- [x] Immutable AuditLog for all auth + org mutations
- [ ] 2FA for admin accounts (Phase 2)
- [ ] Stripe webhook signature verification (Phase 2)
- [ ] S3 presigned URLs for private media (Phase 2)

---

## 10. Background Jobs & Celery (Implemented)

### Task Registry

```python
# users/tasks.py  (queue: emails)
@shared_task(bind=True, max_retries=3)
def send_verification_email(self, user_id: str)
    # Creates EmailVerificationToken (24h TTL)
    # Sends: {FRONTEND_URL}/verify-email?token=XYZ

@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id: str)
    # Creates PasswordResetToken (1h TTL)
    # Sends: {FRONTEND_URL}/reset-password?token=XYZ

@shared_task(bind=True, max_retries=3)
def create_audit_log(self, user_id, action, ip_address, user_agent, metadata)
    # Writes to AuditLog table (non-blocking, fire-and-forget)

# organizations/tasks.py  (queue: emails)
@shared_task(bind=True, max_retries=3)
def send_invitation_email(self, invitation_id: str)
    # Sends: {FRONTEND_URL}/invitations/{token}/accept/
```

### Dev vs Production

```python
# development.py
CELERY_TASK_ALWAYS_EAGER    = True   # tasks run synchronously (no broker needed)
CELERY_TASK_EAGER_PROPAGATES = False  # task exceptions don't crash the view

# All .delay() calls wrapped in _fire() helper:
def _fire(task_func, *args, **kwargs):
    try:
        task_func.delay(*args, **kwargs)
    except Exception:
        try:
            task_func(*args, **kwargs)  # synchronous fallback
        except Exception:
            pass  # never crash the request
```

### Planned Celery Tasks (Phase 2+)

```python
# Booking reminders — every day at 08:00 Asia/Phnom_Penh
send_upcoming_booking_reminders()

# Booking locks — release every hour
release_expired_booking_locks()

# Partner payouts — every day at 10:00
process_daily_partner_payouts()

# Review prompts — 24h after checkout
send_review_reminder_email(booking_id)

# Monthly partner reports — 1st of each month
generate_partner_monthly_report(partner_id, month)

# Platform daily summary
generate_platform_daily_summary()
```

---

## 11. Backend Modules — Planned

### Module A — Hotel & Homestay (Phase 2)

```
accommodations/
├── models.py     → Property, RoomType, RoomInventory, Amenity, PropertyPhoto
├── availability.py → calendar management, SELECT FOR UPDATE locking
├── pricing.py    → dynamic pricing (weekday/weekend/season/event)
└── views.py
```

**Key models:**
- `Property` — name, type (HOTEL/HOMESTAY/VILLA/GUESTHOUSE), city, coordinates, star_rating
- `RoomType` — name, max_occupancy, base_price, bed_type
- `RoomInventory` — date, room_type, available_count, booked_count (locked during checkout)
- `Amenity` — wifi, pool, parking, breakfast, AC (tag system)

**Booking locking:**
```python
# Prevents overbooking under concurrent requests
with transaction.atomic():
    inventory = RoomInventory.objects.select_for_update().filter(
        room_type=room_type,
        date__range=(checkin, checkout),
        available_count__gt=0,
    )
```

---

### Module B — Tour Packages (Phase 2 expansion)

The `api/` app has the base `Tour` model. Phase 2 expands to:

```
tours/
├── models.py  → TourPackage, TourItinerary, TourDay, TourSlot, TourInclusion
└── slots.py   → departure slot management, seat limits
```

- `TourSlot` — start_date, available_seats, price_override, guide_assigned
- Multi-day itineraries: `TourDay` → `DayActivity` (location, duration, description)
- Tour categories: Adventure, Cultural, Food, Nature, City, Angkor, History

---

### Module C — Local Guides (Phase 2)

```
guides/
├── models.py       → GuideProfile, GuideCertification, GuideLanguage, GuideCalendar
└── views.py
```

- `GuideProfile` — bio, languages, specializations, daily_rate, license_number
- `GuideCertification` — cert_type, issuing_authority, expiry_date, document (S3)
- `GuideCalendar` — date, is_available, booking FK
- Specializations: Angkor Wat, Phnom Penh, Koh Rong, Food Tours, Adventure
- Guide verification badge (reviewed by PLATFORM_STAFF)

---

### Module D — Transportation (Phase 2)

```
transportation/
├── models.py  → TransportProvider, Vehicle, Route, Schedule, TransportBooking
└── views.py
```

- **Types:** Airport transfers, city-to-city buses/minivans, private car hire, tuk-tuk, boat/ferry
- `Route` — origin, destination, distance_km, duration_hours
- `Schedule` — route, departure_time, arrival_time, price, available_seats

---

### Module E — Booking Engine (Phase 2)

```
bookings/
├── models.py       → Booking, BookingItem, BookingStatus
├── engine.py       → BookingEngine (check → lock → pay → confirm)
└── cancellation.py → CancellationPolicy, auto-refund logic
```

**Booking State Machine:**
```
PENDING → AWAITING_PAYMENT → CONFIRMED → CHECKED_IN → COMPLETED → REVIEWED
                         ↘ PAYMENT_FAILED → CANCELLED
                                        → REFUNDED
```

**Multi-item booking:** hotel + tour + guide + transport in one checkout, single payment intent.

---

### Module F — Payment (Phase 2)

```
payments/
├── models.py         → Payment, Refund, PartnerPayout
├── stripe_handler.py → PaymentIntent creation, webhook processing
└── views.py
```

**Stripe flow:**
```
Frontend → POST /payments/intent/ → backend creates PaymentIntent + locks inventory
         ← { client_secret }
Frontend → stripe.confirmPayment(client_secret)
Stripe   → POST /payments/webhook/ → backend confirms booking → emails/SMS
```

**Payout logic:** Partner receives (booking total − platform commission). Commission: 12% Basic / 10% Pro / 8% Enterprise. Payouts processed D+1 via Celery.

---

### Module G — Reviews & Ratings (Phase 2)

```
reviews/
├── models.py → Review, ReviewCategory, ReviewPhoto, ReviewVote, ReviewResponse
└── views.py
```

- Only verified (completed) bookings can submit reviews
- 14-day review window after checkout
- Sub-scores: cleanliness, service, value, location, accuracy
- Partner response to reviews
- Aggregate rating cached in Redis (invalidated on new review)

---

### Module H — Notifications (Phase 2)

```
notifications/
├── models.py   → Notification, NotificationPreference
├── channels.py → Email (SendGrid), SMS (Twilio), In-app (WebSocket), Push (FCM Phase 3)
└── tasks.py    → Celery tasks per channel
```

**Events:** booking_confirmed, booking_reminder_24h, payment_receipt, review_reminder, org_approved, payout_processed, new_member_invitation

---

### Module I — Tourism Information (Phase 2)

```
tourism/
├── models.py → Attraction, Province, TravelTip, EventCalendar
└── views.py
```

- Content: Angkor Wat, Phnom Penh, Koh Rong, Tonle Sap, Preah Vihear, etc.
- Events: Khmer New Year, Water Festival, Pchum Ben
- Travel tips: visa, health, safety, currency, language

---

## 12. Database Design

### Core Table Map

```sql
-- Identity
users           (id UUID, email UNIQUE, platform_role, is_email_verified, ...)
email_verification_tokens (user_id, token UNIQUE, expires_at)
password_reset_tokens     (user_id, token UNIQUE, is_used, expires_at)
audit_logs      (user_id, action, ip_address, user_agent, metadata JSON, created_at)

-- Organizations
organizations   (id UUID, name, slug UNIQUE, org_type, status, subscription_tier, ...)
organization_memberships (id UUID, user_id, org_id, role, is_active, permission_overrides JSON)
organization_invitations (id UUID, org_id, email, role, token UNIQUE, is_accepted, expires_at)

-- JWT
token_blacklist_blacklistedtoken (id, token_id)   -- simplejwt
token_blacklist_outstandingtoken (id, user_id, jti, ...)

-- Celery
django_celery_results_taskresult  (task_id, status, result, ...)
django_celery_beat_periodictask   (name, task, schedule, ...)

-- Tours (MVP)
api_tour    (id, title, price, duration_hours, max_participants, organization_id)
api_booking (id, tour_id, user_id, organization_id, status, guest_name, ...)

-- Phase 2 tables (planned)
properties, room_types, room_inventory
tour_packages, tour_slots, tour_itinerary_days
guide_profiles, guide_certifications, guide_availability
transport_routes, transport_schedules
bookings, booking_items
payments, refunds, partner_payouts
reviews, review_categories, review_votes
attractions, provinces, travel_tips
notifications
```

### Key Indexes (Production)

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_platform_role ON users(platform_role);

-- Org membership lookups (critical — checked on every authenticated request)
CREATE INDEX idx_memberships_user_org ON organization_memberships(user_id, organization_id);
CREATE INDEX idx_memberships_org_role ON organization_memberships(organization_id, role);

-- Audit log browsing
CREATE INDEX idx_audit_logs ON audit_logs(user_id, action, created_at);

-- Availability search (Phase 2 — most frequent complex query)
CREATE INDEX idx_room_inventory_date ON room_inventory(date, room_type_id);
CREATE INDEX idx_tour_slots_date ON tour_slots(start_date, available_seats);

-- Search by location (Phase 2)
CREATE INDEX idx_properties_city ON properties(city, status);
CREATE INDEX idx_properties_type ON properties(org_type);
```

---

## 13. Real-time Features

### Django Channels Setup (Phase 2)

```python
# config/asgi.py
application = ProtocolTypeRouter({
    "http":      django_asgi_app,
    "websocket": AuthMiddlewareStack(URLRouter([
        path("ws/notifications/",                 NotificationConsumer.as_asgi()),
        path("ws/chat/<str:booking_ref>/",        ChatConsumer.as_asgi()),
        path("ws/availability/<uuid:property_id>/", AvailabilityConsumer.as_asgi()),
    ])),
})

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG":  {"hosts": [("redis", 6379)]},
    }
}
```

### WebSocket Events

| Channel | Producer | Consumer | Event |
|---------|---------|----------|-------|
| `ws/notifications/` | Celery tasks | Traveler / Partner | booking_confirmed, payout_processed |
| `ws/chat/{booking_ref}/` | Either party | Both | new_message |
| `ws/availability/{property_id}/` | Booking engine | Browsing travelers | seat_count_updated |

---

## 14. Payment System

### Stripe Integration (Phase 2)

```
Traveler selects rooms/tours/guides/transport
       ↓
POST /api/v1/payments/intent/
  → Create Stripe PaymentIntent
  → Lock inventory (SELECT FOR UPDATE)
  → Return { client_secret, booking_ref }
       ↓
Frontend: await stripe.confirmPayment(clientSecret, { return_url })
       ↓ (async webhook)
POST /api/v1/payments/webhook/  (Stripe-Signature verified)
  payment_intent.succeeded   → confirm booking → send emails/SMS
  payment_intent.failed      → release inventory lock → notify user
```

### Partner Subscriptions (dj-stripe)

```python
STRIPE_PLANS = {
    'basic':      'price_xxx_basic_monthly',
    'pro':        'price_xxx_pro_monthly',
    'enterprise': 'price_xxx_enterprise_monthly',
}
# Webhook events: customer.subscription.created/deleted, invoice.payment_succeeded/failed
```

### Financial Safety

- Idempotency keys on all Stripe API calls
- All amounts stored as integers (USD cents / KHR satoshis)
- Atomic DB transaction: inventory lock + payment record creation
- Full refund audit trail

**Local Payment Methods (Phase 3):** ABA Pay / KHQR (Bakong) for Cambodian travelers. Both support QR code payment — Bakong has a REST API.

---

## 15. Search & Price Comparison

### Phase 1 — PostgreSQL Full-Text + django-filter

```python
# Sufficient for 20k users
GET /api/v1/tours/?search=angkor&price_min=20&price_max=100&ordering=price

# DRF filter backends auto-applied:
DEFAULT_FILTER_BACKENDS = [
    DjangoFilterBackend,
    SearchFilter,
    OrderingFilter,
]
```

### Phase 2 — Unified Search Service

```python
class PropertySearchService:
    def search(self, destination, checkin, checkout, guests, filters):
        qs = Property.objects.filter(
            status='ACTIVE',
            city__icontains=destination,
            room_types__room_inventory__date__range=(checkin, checkout),
            room_types__room_inventory__available_count__gte=guests,
        ).distinct()
        # Apply amenity, price, star_rating filters
        # Sort: price_asc | price_desc | rating | newest
        return qs
```

### Caching Strategy

```python
# Search results: 5 min Redis TTL
cache_key = f"search:{location}:{checkin}:{checkout}:{hash(filters)}"
cache.set(cache_key, serialized_results, timeout=300)

# Property detail: 15 min
# Rating aggregates: 1 hr (invalidated on new review)
# Availability calendar: 2 min (high churn)
```

### Phase 4 — Elasticsearch

At 100k+ users and 10k+ properties, migrate to Elasticsearch for:
- Full-text search across titles, descriptions, locations
- Geo-distance search (`within 5km of Angkor Wat`)
- Faceted filters without N+1 queries
- Autocomplete / typeahead

---

## 16. File Storage Strategy

### AWS S3 Structure (Phase 2)

```
adoratrip-media/
├── avatars/{user_id}.jpg
├── properties/{property_id}/
│   ├── main.jpg
│   └── gallery/{n}.jpg
├── guides/{guide_id}/
│   ├── profile.jpg
│   └── certifications/{cert_id}.pdf
├── tours/{tour_id}/gallery/{n}.jpg
├── reviews/{review_id}/photos/{n}.jpg
└── documents/partners/{org_id}/
    ├── business_license.pdf
    └── id_document.pdf         ← private, presigned URL only
```

### Django Storage Config

```python
# production.py
DEFAULT_FILE_STORAGE    = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'adoratrip-media'
AWS_S3_REGION_NAME      = 'ap-southeast-1'
AWS_S3_FILE_OVERWRITE   = False
AWS_DEFAULT_ACL         = None   # block all public ACLs; use presigned URLs

# Image variants on upload (Pillow):
THUMBNAIL_SIZES = {
    'thumb':  (150, 150),
    'medium': (400, 300),
    'large':  (1200, 800),
}
```

---

## 17. Analytics & Reporting

### Data Collection (Phase 2)

```python
class AnalyticsEvent(models.Model):
    event_type = CharField(50)  # search | view | booking | review | page_view
    user       = FK(CustomUser, null=True)   # null for anonymous
    item_type  = CharField(30)  # property | tour | guide | transport
    item_id    = UUIDField()
    metadata   = JSONField()    # search_query, filters, price_seen, etc.
    created_at = DateTimeField(auto_now_add=True)
    ip_address = GenericIPAddressField(null=True)
    session_id = CharField(36, blank=True)
```

### Platform KPIs

| KPI | Formula |
|-----|---------|
| GMV | SUM(booking.total_price) where status=COMPLETED |
| Take Rate | platform_commission / GMV |
| MAU | COUNT(DISTINCT user_id) in last 30 days |
| Conversion Rate | bookings_created / search_sessions |
| ABV | GMV / COUNT(bookings) |
| Booking Lead Time | booking_date − created_at (days) |

### Partner KPIs

| KPI | Formula |
|-----|---------|
| Occupancy Rate | booked_nights / total_nights × 100% |
| ADR | revenue / booked_nights |
| RevPAR | ADR × occupancy_rate |
| Review Score Trend | rolling 30-day average |
| Page-to-Booking | bookings / property_page_views |

---

## 18. Scalability for 20k Users

### Load Estimates

| Metric | Estimate |
|--------|---------|
| Registered users | 20,000 |
| Daily active users | ~4,000 (20%) |
| Peak concurrent users | ~800 |
| Daily API requests | ~200,000 |
| Daily searches | ~50,000 |
| Daily bookings | ~500 |
| WebSocket connections (peak) | ~1,000 |
| DB writes/sec (peak) | ~50 |

### Infrastructure for 20k

A single well-configured server is sufficient with proper caching. No load balancer needed yet.

| Component | Spec | Config |
|-----------|------|--------|
| Django App (Gunicorn) | 4 vCPU, 8 GB RAM | 4 workers × 2 threads |
| PostgreSQL | 4 vCPU, 16 GB RAM | Primary + 1 read replica |
| Redis | 2 vCPU, 4 GB RAM | DB 0: cache/sessions, DB 1: axes, DB 2: Celery |
| Celery Workers | 2 vCPU, 4 GB RAM | 4 concurrent workers |
| Nginx | 2 vCPU, 2 GB RAM | Rate limits + static |

### Optimization Patterns

```python
# Avoid N+1 — always select_related + prefetch_related
users = User.objects.prefetch_related('org_memberships__organization').filter(...)

# Database connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 60   # reuse connections 60s

# Paginate all list endpoints
PAGE_SIZE = 20   # DRF default

# Annotate instead of per-object queries
Property.objects.annotate(
    avg_rating=Avg('reviews__rating'),
    review_count=Count('reviews'),
    min_price=Min('room_types__base_price'),
)

# Cache heavy analytics (1h TTL)
@cache_page(3600)
def platform_analytics_overview(request): ...
```

---

## 19. Infrastructure & Deployment

### Docker Compose Services

| Service | Image | Port | Notes |
|---------|-------|------|-------|
| `db` | postgres:16 | 5432 | Volume-persisted |
| `redis` | redis:7 | 6379 | 3 DB indexes used |
| `api` | local/adoratrip | 8000 | Gunicorn 4 workers |
| `websocket` | local/adoratrip | 8001 | Daphne (Phase 2) |
| `celery_worker` | local/adoratrip | — | queues: default,emails,payments,reports |
| `celery_beat` | local/adoratrip | — | DB-backed scheduler |
| `flower` | local/adoratrip | 5555 | Celery monitoring (dev tools profile) |
| `nginx` | nginx:stable | 80/443 | SSL termination + rate limits |
| `pgadmin` | pgadmin4 | 5050 | DB browser (dev tools profile) |

### Environment Variables (.env)

```bash
# Required in all environments
SECRET_KEY=change-me-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,adoratrip.com
REDIS_URL=redis://redis:6379/0
FRONTEND_URL=http://localhost:3000

# Social auth (Phase 2)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# Production only
DATABASE_URL=postgres://user:pass@db:5432/adoratrip_db
DJANGO_SETTINGS_MODULE=config.settings.production
JWT_REFRESH_COOKIE_SECURE=True
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_STORAGE_BUCKET_NAME=adoratrip-media
AWS_S3_REGION_NAME=ap-southeast-1
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SENDGRID_API_KEY=SG.xxx
DEFAULT_FROM_EMAIL=AdoraTrip <noreply@adoratrip.com>
SENTRY_DSN=https://xxx@sentry.io/yyy
```

### Production Architecture

```
                    ┌──────────────────────┐
                    │    Cloudflare CDN     │
                    │  DDoS shield, assets  │
                    └──────────┬───────────┘
                               │
                    ┌──────────────────────┐
                    │    Nginx Server       │
                    │  SSL + rate limits    │
                    └────┬──────────┬───────┘
                         │          │
             ┌───────────┘          └──────────┐
             ▼                                  ▼
  ┌────────────────────┐             ┌────────────────────┐
  │  Gunicorn (HTTP)   │             │  Daphne (WS/ASGI)  │
  │  /api/v1/          │             │  /ws/              │
  └──────────┬─────────┘             └──────────┬─────────┘
             └─────────────┬──────────────────────┘
                           ▼
              ┌────────────┼──────────────┐
              ▼            ▼              ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │PostgreSQL│ │  Redis   │ │Celery Workers│
        │+ replica │ │ 3 DBs    │ │+ Beat        │
        └──────────┘ └──────────┘ └──────────────┘
```

---

## 20. Monitoring & Observability

### Error Tracking (Phase 2)

```python
# production.py
import sentry_sdk
sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    traces_sample_rate=0.1,   # 10% sampled for performance
    environment='production',
)
```

### Health Check Endpoint

```python
# GET /api/v1/health/
{
    "status": "ok",
    "database": "connected",
    "redis": "connected",
    "celery": "running",
    "version": "1.0.0",
    "timestamp": "2026-04-16T12:00:00+07:00"
}
```

### Logging

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/adoratrip/django.log',
            'maxBytes': 10 * 1024 * 1024,   # 10 MB
            'backupCount': 5,
        },
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django':    {'handlers': ['file', 'console'], 'level': 'WARNING'},
        'adoratrip': {'handlers': ['file', 'console'], 'level': 'INFO'},
        'celery':    {'handlers': ['file'],             'level': 'INFO'},
    },
}
```

### Alerts

- UptimeRobot / Better Uptime — ping `/api/v1/health/` every 5 minutes
- Alert triggers: API response time > 3s, error rate > 1%, Celery queue depth > 1000

### Celery Monitoring

- **Flower** — real-time task dashboard on port 5555 (dev only, behind auth in prod)
- Alert on: failed tasks, queue backlog, worker offline

---

## 21. Development Roadmap (Phases)

### Phase 1 — Identity & Organization Foundation ✅ COMPLETE

> Auth, RBAC, Organizations — all endpoints live and smoke-tested

- [x] Settings restructured: `adoratrip_api/` → `config/settings/{base,development,production}.py`
- [x] CustomUser (UUID PK, email auth, PlatformRole)
- [x] JWT: access 60min + refresh 30d, rotation, blacklist, HttpOnly cookie
- [x] CustomJWTAuthentication — Redis jti invalidation (all-devices logout)
- [x] Custom JWT claims: platform_role, is_email_verified, org_memberships
- [x] Registration, Login, Logout, Token Refresh, /me/ (GET/PATCH/DELETE)
- [x] Email verification flow (token + Celery task)
- [x] Password reset flow (token + Celery task + all-device invalidation)
- [x] Change password (logged-in user)
- [x] Google OAuth2 + Facebook OAuth2 (django-allauth + custom adapters)
- [x] django-axes brute force: 5 failures → 1h lockout
- [x] Named throttle scopes per endpoint
- [x] Organizations model (HOTEL, HOMESTAY, TOUR_OPERATOR, TRANSPORT, ATTRACTION, RESTAURANT, TRAVEL_AGENCY)
- [x] OrganizationMembership (OWNER/MANAGER/STAFF/FINANCE + permission_overrides JSONField)
- [x] OrganizationInvitation (magic-link, 7-day TTL)
- [x] Platform role auto-sync signal (OWNER membership → PARTNER_OWNER platform_role)
- [x] All org endpoints: CRUD, member management, invitation accept, admin approval
- [x] OrgContextMiddleware + AuditLogMiddleware
- [x] Django Admin for all models (AuditLog read-only)
- [x] Swagger / OpenAPI docs at `/api/docs/`
- [x] Docker Compose (api, db, redis, celery, nginx, flower)
- [x] Full smoke-test passing (register → login → /me/ → create org → invite member → logout)

---

### Phase 2 — Full Booking Platform (Months 2–4)

**Goal: Travelers can search, book, and pay across all service types**

- [ ] Accommodation module (Property, RoomType, RoomInventory, availability calendar)
- [ ] Tour packages expansion (TourSlot, multi-day itineraries, seat management)
- [ ] Local Guides module (profile, certifications, calendar)
- [ ] Transportation module (routes, schedules, booking)
- [ ] Unified Booking Engine (multi-item checkout, atomic locking, state machine)
- [ ] Stripe payments + webhook handler
- [ ] Partner payout Celery tasks
- [ ] Review & Rating system (verified booking only, sub-scores, partner response)
- [ ] Tourism Information pages (attractions, provinces, events)
- [ ] Notification system (email + SMS + in-app WebSocket)
- [ ] Django Channels + Daphne (WebSocket real-time)
- [ ] AWS S3 file storage (django-storages + Pillow)
- [ ] Partner analytics dashboard API
- [ ] Social login redirect to frontend with JWT (complete OAuth flow)
- [ ] Health check endpoint

**Team:** 2 backend + 1 frontend

---

### Phase 3 — Growth & Engagement (Months 5–7)

**Goal: Retention, mobile, multi-language**

- [ ] Traveler ↔ Partner chat (WebSocket, stored in DB)
- [ ] Promo codes & discounts system
- [ ] Loyalty points program (earn per booking, redeem at checkout)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] React Native mobile app (Expo, same DRF APIs)
- [ ] Multi-language: English, Khmer (ខ្មែរ), Chinese (中文)
- [ ] Multi-currency: USD + KHR with live exchange rate
- [ ] ABA Pay / KHQR (Bakong) — local payment for Cambodian travelers
- [ ] Advanced analytics (cohort retention, booking funnel, A/B testing)
- [ ] 2FA for admin accounts (TOTP)
- [ ] B2B partner API (for travel agencies to pull inventory)

---

### Phase 4 — Scale to 100k+ (Month 8+)

**Goal: Handle 5× traffic with horizontal scaling**

- [ ] Migrate to AWS (EC2 + RDS PostgreSQL + ElastiCache Redis)
- [ ] PostgreSQL read replica for analytics queries
- [ ] Elasticsearch for full-text + geo search
- [ ] CloudFront CDN for all media
- [ ] Horizontal app server scaling (load balancer + multiple Gunicorn instances)
- [ ] Database connection pooling (PgBouncer)
- [ ] Celery auto-scaling workers
- [ ] White-label option for chain hotel partners
- [ ] Enterprise SSO (SAML/OIDC) — when first enterprise customer requires it
- [ ] Multi-region failover (Singapore AZ)

---

*AdoraTrip Backend Architecture — Version 2.0*
*Updated April 2026 — Reflects actual implementation state*
*Cambodia Travel Super App — Django 5.1 + DRF + SimpleJWT + django-allauth + Celery + PostgreSQL + Redis*
