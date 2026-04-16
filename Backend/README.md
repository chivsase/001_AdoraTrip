# AdoraTrip — Cambodia Travel Super App

> A production-grade Django REST API powering a unified travel marketplace for Cambodia — Hotels, Homestays, Tour Packages, Local Guides, Transportation, Attractions, and more.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Quick Start (Docker)](#quick-start-docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [RBAC — Roles & Permissions](#rbac--roles--permissions)
- [Running Tests](#running-tests)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

AdoraTrip is a B2B2C travel platform:

| Who | What they do |
|-----|-------------|
| **Travelers** | Search, compare, book, pay, review hotels/tours/guides/transport |
| **Partner Organizations** | Hotels, Homestays, Tour Operators, Transport companies — manage listings and bookings |
| **Platform Admins** | Approve partners, manage users, view analytics |

**Scale target:** 20,000 active users  
**Region:** Cambodia (Asia/Phnom_Penh timezone, USD + KHR)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Django 5.1.4 + Django REST Framework 3.15.2 |
| Auth | SimpleJWT 5.4.0 (JWT access + refresh) + django-allauth 65.3.0 (Google/Facebook OAuth2) |
| Database | SQLite (dev) / PostgreSQL 16 (prod) |
| Cache / Broker | Redis 7 |
| Task Queue | Celery 5.4.0 + django-celery-beat |
| Brute Force | django-axes 7.0.1 |
| API Docs | drf-spectacular 0.28.0 (Swagger UI) |
| Containerization | Docker + Docker Compose + Nginx |
| Settings | python-decouple (`.env` file) |

---

## Project Structure

```
AdoraTrip/
├── config/                      # Django configuration package
│   ├── __init__.py              # Imports celery app at startup
│   ├── celery.py                # Celery app instance
│   ├── settings/
│   │   ├── base.py              # Shared settings (JWT, allauth, axes, CORS, Celery)
│   │   ├── development.py       # SQLite, console email, no Redis required
│   │   └── production.py        # PostgreSQL, Redis, S3, SendGrid, Sentry
│   ├── urls.py                  # Root URL config
│   ├── wsgi.py
│   └── asgi.py
│
├── users/                       # Identity & Auth (fully implemented)
│   ├── models.py                # CustomUser, EmailVerificationToken, PasswordResetToken, AuditLog
│   ├── managers.py              # CustomUserManager
│   ├── authentication.py        # CustomJWTAuthentication (Redis token invalidation)
│   ├── serializers.py           # Register, Login, Profile, Password flows
│   ├── views.py                 # All auth endpoints
│   ├── urls.py                  # 14 routes at /api/v1/auth/
│   ├── permissions.py           # IsAuthenticatedAndVerified, IsSuperAdmin, IsPlatformStaff, …
│   ├── adapters.py              # CustomAccountAdapter + CustomSocialAccountAdapter
│   ├── middleware.py            # OrgContextMiddleware, AuditLogMiddleware
│   ├── signals.py               # google_linked / facebook_linked flags
│   ├── tasks.py                 # send_verification_email, send_password_reset_email, create_audit_log
│   ├── throttles.py             # Per-endpoint rate limiters
│   ├── tokens.py                # generate_secure_token
│   └── admin.py
│
├── organizations/               # Multi-tenancy & RBAC (fully implemented)
│   ├── models.py                # Organization, OrganizationMembership, OrganizationInvitation
│   ├── serializers.py
│   ├── views.py                 # Org CRUD, member management, admin approval
│   ├── urls.py                  # 12 routes at /api/v1/organizations/
│   ├── permissions.py           # IsOrgOwner, IsOrgManager, IsOrgStaff, IsOrgFinance
│   ├── signals.py               # Auto-sync platform_role on membership change
│   ├── tasks.py                 # send_invitation_email
│   └── admin.py
│
├── api/                         # Tour & Booking MVP
│   ├── models.py                # Tour (+ org FK), Booking (+ user FK + org FK)
│   ├── serializers.py
│   ├── views.py                 # TourViewSet, BookingViewSet
│   └── urls.py                  # /api/v1/tours/, /api/v1/bookings/
│
├── requirements/
│   ├── base.txt                 # All runtime dependencies
│   ├── development.txt
│   └── production.txt
│
├── docker/
│   ├── nginx/nginx.conf         # Rate limits, SSL, WebSocket proxy
│   └── entrypoint.sh
│
├── docker-compose.yml           # Full local stack
├── docker-compose.prod.yml      # Production overrides
├── Dockerfile                   # Multi-stage: base → development → production
└── manage.py
```

---

## Quick Start (Local Dev)

**Requirements:** Python 3.11+, Git

```bash
# 1. Clone and enter the project
git clone <repo-url> AdoraTrip
cd AdoraTrip

# 2. Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements/base.txt

# 4. Copy and configure environment
cp .env.example .env
# Edit .env — only SECRET_KEY is required for local dev

# 5. Run migrations
python manage.py migrate

# 6. Create a superuser
python manage.py createsuperuser

# 7. Start the server
python manage.py runserver
```

The API is now available at `http://localhost:8000`

| URL | Description |
|-----|-------------|
| `http://localhost:8000/api/docs/` | Swagger UI (interactive API docs) |
| `http://localhost:8000/admin/` | Django Admin |
| `http://localhost:8000/api/v1/auth/csrf/` | CSRF cookie (call first from frontend) |

> **Note:** In development, email verification is skipped (`ACCOUNT_EMAIL_VERIFICATION=none`), Celery tasks run synchronously (no Redis needed), and the refresh cookie is set without `Secure` flag.

---

## Quick Start (Docker)

**Requirements:** Docker Desktop

```bash
# Start full stack (Django + PostgreSQL + Redis + Nginx + Celery)
docker compose up --build

# Run migrations inside the container
docker compose exec api python manage.py migrate

# Create superuser
docker compose exec api python manage.py createsuperuser

# View logs
docker compose logs -f api
docker compose logs -f celery_worker
```

| Service | URL | Notes |
|---------|-----|-------|
| API | `http://localhost/api/v1/` | via Nginx |
| Swagger Docs | `http://localhost/api/docs/` | |
| Django Admin | `http://localhost/admin/` | |
| Flower (Celery) | `http://localhost:5555` | dev tools profile only |
| PgAdmin | `http://localhost:5050` | dev tools profile only |

```bash
# Start with dev tools (Flower + PgAdmin)
docker compose --profile tools up
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
# ── Required ──────────────────────────────────────────────
SECRET_KEY=your-secret-key-here           # Django secret key
ALLOWED_HOSTS=localhost,127.0.0.1         # Comma-separated

# ── Database ──────────────────────────────────────────────
# Leave blank for SQLite (development default)
DATABASE_URL=postgres://user:pass@db:5432/adoratrip_db

# ── Redis ─────────────────────────────────────────────────
# Leave blank; dev uses locmem cache
REDIS_URL=redis://redis:6379/0

# ── Frontend ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000        # Used in email links
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000

# ── Email ─────────────────────────────────────────────────
# Dev: prints to console (EMAIL_BACKEND=console)
DEFAULT_FROM_EMAIL=AdoraTrip <noreply@adoratrip.com>
# Prod: set SENDGRID_API_KEY or EMAIL_HOST/PORT/USER/PASSWORD

# ── Social Auth (Phase 2) ─────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# ── AWS S3 (Phase 2) ──────────────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=adoratrip-media
AWS_S3_REGION_NAME=ap-southeast-1

# ── Stripe (Phase 2) ──────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ── Production only ───────────────────────────────────────
DJANGO_SETTINGS_MODULE=config.settings.production
JWT_REFRESH_COOKIE_SECURE=True
SENTRY_DSN=https://xxx@sentry.io/yyy
```

---

## API Reference

### Base URL: `/api/v1/`

### Auth Endpoints — `/api/v1/auth/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `csrf/` | None | Set CSRF cookie — call on app load |
| POST | `register/` | None | Create traveler account, returns JWT |
| POST | `login/` | None | Email + password → JWT tokens |
| POST | `logout/` | Bearer | Blacklist refresh token + clear cookie |
| POST | `token/refresh/` | Cookie | Rotate refresh → new access + refresh |
| POST | `token/verify/` | None | Verify access token validity |
| GET | `me/` | Bearer | Current user profile + org memberships |
| PATCH | `me/` | Bearer | Update full_name, phone, avatar |
| DELETE | `me/` | Bearer | Soft-delete account (GDPR) |
| POST | `email/verify/` | None | Consume verification token |
| POST | `email/resend-verification/` | Bearer | Resend verification email |
| POST | `password/reset/request/` | None | Request reset email (always 200) |
| POST | `password/reset/confirm/` | None | Set new password, invalidate all JWTs |
| POST | `password/change/` | Bearer | Change password (requires current) |
| GET | `admin/users/` | Staff | List users with search + role filter |
| PATCH | `admin/users/<uuid>/` | SuperAdmin | Update platform_role, is_active |

### Organization Endpoints — `/api/v1/organizations/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| POST | `/` | Verified | Register new organization (PENDING) |
| GET | `mine/` | Verified | My org memberships |
| GET | `<org_id>/` | Org Member | Org detail |
| PATCH | `<org_id>/` | Org Owner | Update org profile |
| GET | `<org_id>/members/` | Org Manager | List members + roles |
| POST | `<org_id>/members/invite/` | Org Owner | Send invitation email |
| DELETE | `<org_id>/members/<user_id>/` | Org Owner | Remove member |
| PATCH | `<org_id>/members/<user_id>/role/` | Org Owner | Change member role |
| POST | `invitations/<token>/accept/` | None | Accept magic-link invitation |
| GET | `admin/` | Platform Staff | List all orgs |
| POST | `admin/<org_id>/approve/` | Super Admin | Approve org → ACTIVE |
| POST | `admin/<org_id>/suspend/` | Super Admin | Suspend org |
| POST | `admin/<org_id>/reject/` | Super Admin | Reject with reason |

### Tour & Booking Endpoints — `/api/v1/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `tours/` | None | List / search tours |
| POST | `tours/` | Org Staff | Create tour (auto-sets organization) |
| GET | `tours/<id>/` | None | Tour detail |
| PATCH/DELETE | `tours/<id>/` | Org Staff | Update / delete tour |
| GET | `bookings/` | Authenticated | My bookings |
| POST | `bookings/` | Verified | Create booking |
| GET | `bookings/<id>/` | Authenticated | Booking detail |

### API Documentation

| URL | Description |
|-----|-------------|
| `/api/schema/` | OpenAPI 3 schema (JSON/YAML) |
| `/api/docs/` | Swagger UI |

---

## Authentication Flow

### 1. Get CSRF Token (SPA apps)

```bash
curl -c cookies.txt http://localhost:8000/api/v1/auth/csrf/
# → sets csrftoken cookie
```

### 2. Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken>" \
  -d '{
    "email": "traveler@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "full_name": "Sokha Pich"
  }'
# → 201: { "user": {...}, "access": "<jwt>", "refresh": "<jwt>" }
# → HttpOnly cookie: adoratrip_refresh=<token>
```

### 3. Authenticated Request

```bash
curl http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer <access_token>"
```

### 4. Refresh Access Token

```bash
# Reads refresh token from HttpOnly cookie automatically
curl -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -b cookies.txt -c cookies.txt \
  -H "X-CSRFToken: <csrftoken>"
# → 200: { "access": "<new_jwt>", "refresh": "<new_jwt>" }
```

### 5. Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  -b cookies.txt -c cookies.txt \
  -H "Authorization: Bearer <access_token>" \
  -H "X-CSRFToken: <csrftoken>"
# → 200: { "detail": "Successfully logged out." }
# → refresh token blacklisted, cookie cleared
```

### Token Details

| Token | Lifetime | Location | Notes |
|-------|----------|----------|-------|
| Access | 60 minutes | JSON response body | Store in JS memory (Zustand), never localStorage |
| Refresh | 30 days | HttpOnly cookie `adoratrip_refresh` | Rotated on every use, blacklisted on logout |

---

## RBAC — Roles & Permissions

### Platform Roles (on CustomUser)

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform control, approve orgs, manage all users |
| `PLATFORM_STAFF` | Support & moderation, read-only analytics |
| `PARTNER_OWNER` | Full org access, invite/remove members |
| `PARTNER_MANAGER` | Manage bookings, inventory, pricing |
| `PARTNER_STAFF` | View bookings, update check-in status |
| `PARTNER_FINANCE` | Revenue reports only |
| `LOCAL_GUIDE` | Guide profile + guide bookings |
| `TRANSPORT_PROVIDER` | Transport listings |
| `TRAVELER` | Default role — browse and book |

**Platform role is auto-synced** from the user's highest-priority active organization membership.

### Organization Roles (per org membership)

| Role | Permissions |
|------|-------------|
| `OWNER` | Full org access, invite/remove members, update org profile |
| `MANAGER` | Manage bookings, inventory, pricing |
| `STAFF` | View bookings, update check-in |
| `FINANCE` | Revenue reports only |

### Create an Organization

```bash
curl -X POST http://localhost:8000/api/v1/organizations/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken>" \
  -d '{
    "name": "Angkor Palace Hotel",
    "slug": "angkor-palace-hotel",
    "org_type": "HOTEL",
    "business_email": "info@angkorpalace.com",
    "business_phone": "+85523456789"
  }'
# → 201: org created with status=PENDING
# → creator's platform_role updated to PARTNER_OWNER automatically
```

### Invite a Team Member

```bash
curl -X POST http://localhost:8000/api/v1/organizations/<org_id>/members/invite/ \
  -H "Authorization: Bearer <owner_access_token>" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken>" \
  -d '{
    "email": "manager@angkorpalace.com",
    "role": "MANAGER"
  }'
# → 201: invitation email sent with magic link
```

### Multi-Organization Context

If a user belongs to multiple organizations, pass the `X-Organization-Id` header:

```bash
curl http://localhost:8000/api/v1/tours/ \
  -H "Authorization: Bearer <access_token>" \
  -H "X-Organization-Id: <org_uuid>"
```

---

## Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test organizations

# With verbosity
python manage.py test --verbosity=2

# Quick smoke test (manual — all should return expected status codes)
python manage.py runserver &
curl -s http://localhost:8000/api/v1/auth/csrf/          # → 200
curl -s -X POST http://localhost:8000/api/v1/auth/register/ ...  # → 201
curl -s http://localhost:8000/api/v1/auth/me/ -H "Authorization: Bearer ..."  # → 200
curl -s http://localhost:8000/api/v1/tours/              # → 200
curl -s http://localhost:8000/api/v1/auth/admin/users/   # → 401
```

---

## Development Guide

### Add a New Module

```bash
# 1. Create the app
python manage.py startapp accommodations

# 2. Add to INSTALLED_APPS in config/settings/base.py
INSTALLED_APPS = [..., 'accommodations']

# 3. Create models, serializers, views, urls

# 4. Mount URL in config/urls.py
path('api/v1/accommodations/', include('accommodations.urls', namespace='accommodations'))

# 5. Create and run migrations
python manage.py makemigrations accommodations
python manage.py migrate
```

### Migrations Workflow

```bash
# After changing a model
python manage.py makemigrations
python manage.py migrate

# Check migration plan (dry run)
python manage.py migrate --plan

# Reset a specific app (dev only)
python manage.py migrate <app_name> zero
rm <app_name>/migrations/0*.py
python manage.py makemigrations <app_name>
python manage.py migrate
```

### Django Shell

```bash
python manage.py shell

# Example: create a superuser programmatically
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.create_superuser(
    email='admin@adoratrip.com',
    password='AdminPass123!',
    full_name='Admin',
)
```

### Celery (Background Tasks)

```bash
# Development: tasks run synchronously (no Redis needed)
# CELERY_TASK_ALWAYS_EAGER = True in development.py

# Production: start worker separately
celery -A config worker -l info -Q default,emails,payments,reports

# Start beat scheduler (cron jobs)
celery -A config beat -l info

# Monitor tasks (Flower) — requires: pip install flower
celery -A config worker --loglevel=info &
celery -A config flower --port=5555
```

### API Schema

```bash
# Regenerate OpenAPI schema
python manage.py spectacular --file schema.yml

# View interactive docs at:
# http://localhost:8000/api/docs/
```

---

## Troubleshooting

### Port already in use

```bash
python manage.py runserver 8001
```

### Migration errors

```bash
# Show current migration state
python manage.py showmigrations

# Apply specific migration
python manage.py migrate users 0001_initial

# Reset and rebuild (dev only — destroys all data)
python manage.py migrate users zero
python manage.py migrate organizations zero
python manage.py migrate api zero
python manage.py migrate
```

### `axes.W001` warning (no Redis in dev)

Already handled — `development.py` sets:
```python
AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'
```

### Celery `OperationalError: [WinError 10061]` (no Redis)

Already handled — `development.py` sets:
```python
CELERY_TASK_ALWAYS_EAGER    = True
CELERY_TASK_EAGER_PROPAGATES = False
```
All `.delay()` calls also have a `_fire()` wrapper that falls back to synchronous execution.

### `AssertionError: redundant source=` on serializer field

Remove the `source=` argument when the field name matches the model attribute name exactly.

### Django Admin — `CSRF verification failed`

Ensure you're accessing admin via `http://` not `file://`, and that `CSRF_TRUSTED_ORIGINS` includes your dev URL.

### Reset all data (dev only)

```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## License

This project is proprietary — AdoraTrip &copy; 2026. All rights reserved.
