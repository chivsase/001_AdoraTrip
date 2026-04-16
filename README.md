# AdoraTrip — Cambodia Travel Super App

A full-stack monorepo for AdoraTrip: a modern travel platform for Cambodia offering
tour bookings, multi-tenant organization management, real-time communication, and a
rich dashboard UI. Built with Django 5 on the backend and Next.js 16 on the frontend.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Quick Start](#4-quick-start)
   - [Local Development (without Docker)](#41-local-development-without-docker)
   - [Docker Development](#42-docker-development)
   - [Production](#43-production)
5. [Environment Variables](#5-environment-variables)
6. [Backend](#6-backend)
   - [Django Application Layout](#61-django-application-layout)
   - [Settings System](#62-settings-system)
   - [Authentication & JWT](#63-authentication--jwt)
   - [RBAC Permission System](#64-rbac-permission-system)
   - [Organization Multi-Tenancy](#65-organization-multi-tenancy)
   - [API Reference](#66-api-reference)
   - [Background Jobs (Celery)](#67-background-jobs-celery)
   - [WebSocket / Real-time](#68-websocket--real-time)
   - [Security Layers](#69-security-layers)
7. [Frontend](#7-frontend)
   - [Next.js Application Layout](#71-nextjs-application-layout)
   - [UI Stack](#72-ui-stack)
   - [Routing](#73-routing)
   - [Configuration](#74-configuration)
8. [Docker Infrastructure](#8-docker-infrastructure)
   - [Services](#81-services)
   - [Volumes](#82-volumes)
   - [Nginx Routing](#83-nginx-routing)
   - [Multi-Stage Builds](#84-multi-stage-builds)
9. [Development Workflows](#9-development-workflows)
   - [Database Migrations](#91-database-migrations)
   - [Creating a Superuser](#92-creating-a-superuser)
   - [Django Shell](#93-django-shell)
   - [Celery Tasks](#94-celery-tasks)
   - [Adding a New Django App](#95-adding-a-new-django-app)
   - [Running Tests](#96-running-tests)
10. [Planned Modules (Phases 2-4)](#10-planned-modules-phases-2-4)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Architecture

```
                        ┌─────────────────────────────────────────┐
                        │            Browser / Mobile              │
                        └──────────────────┬──────────────────────┘
                                           │ HTTP / WS
                        ┌──────────────────▼──────────────────────┐
                        │           Nginx (port 80/443)            │
                        │   Reverse proxy + static file server     │
                        └───┬────────────┬────────────┬───────────┘
                            │ /api/      │ /ws/       │ /
                ┌───────────▼──┐  ┌──────▼──────┐  ┌─▼───────────┐
                │  Django API  │  │   Daphne    │  │  Next.js    │
                │  Gunicorn    │  │   ASGI/WS   │  │  App Server │
                │  (api:8000)  │  │ (ws:8001)   │  │ (fe:3000)   │
                └──────┬───────┘  └──────┬──────┘  └─────────────┘
                       │                 │
          ┌────────────┼─────────────────┘
          │            │
   ┌──────▼──────┐  ┌──▼──────┐  ┌─────────────────┐
   │ PostgreSQL  │  │  Redis  │  │  Celery Worker  │
   │    :5432    │  │  :6379  │  │  + Beat (cron)  │
   └─────────────┘  └─────────┘  └─────────────────┘
```

**Data flows:**
- REST API calls → `/api/*` → Nginx → Gunicorn → Django → PostgreSQL/Redis
- WebSocket connections → `/ws/*` → Nginx → Daphne → Django Channels → Redis channel layer
- Frontend pages → `/` → Nginx → Next.js standalone server
- Background tasks → Celery Worker consuming from Redis broker
- Scheduled tasks → Celery Beat → Redis broker → Celery Worker

---

## 2. Tech Stack

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Django | 5.1.4 |
| REST API | Django REST Framework | 3.15.2 |
| ASGI / WebSocket | Django Channels + Daphne | 4.2.0 / 4.1.2 |
| Auth | SimpleJWT + django-allauth | 5.4.0 / 65.3.0 |
| Database | PostgreSQL | 16 |
| ORM driver | psycopg2-binary | 2.9.10 |
| Cache / Broker | Redis | 7 |
| Task queue | Celery + django-celery-beat | 5.4.0 / 2.7.0 |
| Storage | AWS S3 via django-storages | 1.14.4 |
| Payments | Stripe + dj-stripe | 11.2.0 / 2.9.0 |
| API Docs | drf-spectacular (OpenAPI 3) | 0.28.0 |
| Settings | python-decouple | 3.8 |
| Brute-force | django-axes | 7.0.1 |
| HTTP Server | Gunicorn (prod) / runserver (dev) | — |
| Python | 3.12 | — |

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.1 |
| Language | TypeScript | 5.9.3 |
| React | React 19 | 19.2.1 |
| UI Components | MUI (Material UI) | 7.3.6 |
| Styling | Tailwind CSS | 4.1.17 |
| Icons | Iconify | — |
| Package Manager | pnpm | — |
| Build | Turbopack (dev) | — |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Container runtime | Docker + Docker Compose v2 |
| Reverse proxy | Nginx 1.25-alpine |
| CI/CD | GitHub Actions (planned) |
| Monitoring | Sentry (planned) |
| SSL | Let's Encrypt / Certbot |

---

## 3. Project Structure

```
AdoraTrip/
├── docker-compose.yml          # Full-stack dev orchestration
├── docker-compose.prod.yml     # Production overlay (extends base)
├── docker/
│   └── nginx/
│       ├── nginx.conf          # Dev nginx config
│       └── nginx.prod.conf     # Production TLS config
├── .env                        # Local secrets (git-ignored)
├── .env.example                # Template — copy to .env
├── .gitignore                  # Root gitignore (covers both services)
│
├── Backend/                    # Django monolith
│   ├── Dockerfile              # Multi-stage: base/builder/dev/prod
│   ├── .dockerignore
│   ├── manage.py
│   ├── requirements/
│   │   ├── base.txt            # All production dependencies
│   │   ├── development.txt     # Dev extras (debug-toolbar, factory-boy)
│   │   └── production.txt      # Prod extras (gunicorn, sentry-sdk)
│   ├── config/                 # Django project config
│   │   ├── settings/
│   │   │   ├── base.py         # Shared settings
│   │   │   ├── development.py  # Dev overrides + conditional DB/Redis
│   │   │   └── production.py   # Prod overrides + security hardening
│   │   ├── urls.py             # Root URL conf + health check endpoint
│   │   ├── asgi.py             # ASGI application (Channels)
│   │   ├── wsgi.py             # WSGI application (Gunicorn)
│   │   └── celery.py           # Celery application
│   ├── docker/
│   │   ├── entrypoint.sh       # DB wait → migrate → collectstatic → superuser
│   │   └── postgres/
│   │       └── init.sql        # DB initialization seed
│   ├── users/                  # Custom user model + auth
│   ├── organizations/          # Multi-tenant org management
│   ├── api/                    # Tours & bookings MVP
│   └── staticfiles/            # collectstatic output (git-ignored)
│
├── Frontend/                   # Next.js admin dashboard
│   ├── Dockerfile              # Multi-stage: base/deps/builder/runner/dev
│   ├── .dockerignore
│   ├── next.config.ts          # output: 'standalone' for Docker
│   ├── package.json            # pnpm workspace
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── postcss.config.mjs      # Tailwind CSS PostCSS config
│   └── src/
│       ├── app/                # Next.js App Router
│       │   ├── layout.tsx      # Root layout (fonts, providers)
│       │   ├── globals.css     # Global styles
│       │   ├── (dashboard)/    # Authenticated layout group
│       │   │   ├── layout.tsx
│       │   │   ├── home/
│       │   │   └── about/
│       │   └── (blank-layout-pages)/  # Auth / unauthenticated pages
│       │       ├── layout.tsx
│       │       └── login/
│       ├── @core/              # Core utilities, hooks, theme
│       ├── @layouts/           # Layout components
│       ├── @menu/              # Navigation menu system
│       ├── assets/             # Icons, images, fonts
│       ├── components/         # Shared UI components
│       ├── configs/            # App configuration
│       ├── data/               # Static data / mock data
│       ├── types/              # TypeScript type definitions
│       ├── utils/              # Utility functions
│       └── views/              # Page-level view components
│
└── FrontendUISample/           # Reference UI (Materio template, read-only)
```

---

## 4. Quick Start

### 4.1 Local Development (without Docker)

**Backend:**

```bash
cd Backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements/development.txt

# Configure environment (SQLite is used automatically when DATABASE_URL is not set)
cp ../.env.example ../.env
# Edit .env — only DJANGO_SECRET_KEY is required for local dev

# Run migrations and start
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# API available at http://127.0.0.1:8000
```

**Frontend:**

```bash
cd Frontend

# Install dependencies (requires pnpm — install via: npm install -g pnpm)
pnpm install

# Start dev server with Turbopack
pnpm dev
# App available at http://localhost:3000
```

### 4.2 Docker Development

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your values (see Section 5)

# Build and start all services
docker compose up --build

# With optional dev tools (Flower task monitor + pgAdmin)
docker compose --profile tools up --build
```

| Service | URL |
|---------|-----|
| App (via Nginx) | http://localhost |
| Django API (direct) | http://localhost:8000 |
| Next.js (direct) | http://localhost:3000 |
| Django Admin | http://localhost/admin/ |
| API Docs (Swagger) | http://localhost/api/docs/ |
| API Docs (ReDoc) | http://localhost/api/docs/redoc/ |
| OpenAPI schema JSON | http://localhost/api/schema/ |
| Celery Flower | http://localhost:5555 (tools profile) |
| pgAdmin | http://localhost:5050 (tools profile) |
| WebSocket (direct) | ws://localhost:8001 |

**Useful Docker commands:**

```bash
# View logs for a specific service
docker compose logs -f api

# Run Django management commands
docker compose exec api python manage.py shell
docker compose exec api python manage.py createsuperuser
docker compose exec api python manage.py migrate

# Rebuild a single service after Dockerfile changes
docker compose up --build api

# Stop all services
docker compose down

# Stop and remove all volumes (full reset)
docker compose down -v
```

### 4.3 Production

```bash
# Ensure all required env vars are set (no fallback defaults in prod)
# See Section 5 for required production variables

# Build and start production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check status
docker compose ps
docker compose logs -f api
```

The production overlay (`docker-compose.prod.yml`):
- Switches to Gunicorn for Django (via Dockerfile's `CMD`)
- Switches to `nginx.prod.conf` (TLS + Let's Encrypt)
- Removes all source-code volume mounts (images are self-contained)
- Applies resource limits (CPU + memory) to all services
- Disables Flower and pgAdmin (profiled out)

---

## 5. Environment Variables

Copy `.env.example` to `.env` and fill in your values.

### Required for all environments

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here     # Generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_DEBUG=True                           # Set to False in production

# Database
POSTGRES_DB=adoratrip_db
POSTGRES_USER=adoratrip_user
POSTGRES_PASSWORD=your-db-password
DATABASE_URL=postgres://adoratrip_user:your-db-password@db:5432/adoratrip_db

# Redis
REDIS_URL=redis://redis:6379/0
```

### Authentication

```env
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# JWT tokens
ACCESS_TOKEN_LIFETIME=60          # minutes
REFRESH_TOKEN_LIFETIME=43200      # minutes (30 days)
```

### Email

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@adoratrip.com
```

### AWS S3 (media/file storage)

```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=adoratrip-media
AWS_S3_REGION_NAME=ap-southeast-1
```

### Payments (Stripe)

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production extras

```env
REDIS_PASSWORD=strong-redis-password      # Required in prod (requirepass)
POSTGRES_PASSWORD=strong-db-password      # No fallback in prod
SENTRY_DSN=https://...@sentry.io/...
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Dev tools (optional)

```env
FLOWER_USER=admin
FLOWER_PASSWORD=admin123
PGADMIN_EMAIL=admin@adoratrip.com
PGADMIN_PASSWORD=admin123
```

---

## 6. Backend

### 6.1 Django Application Layout

```
Backend/
├── config/                   # Project config (not a Django app)
│   ├── settings/
│   │   ├── base.py           # Installed apps, middleware, auth, Celery, S3, Sentry
│   │   ├── development.py    # DEBUG=True, conditional SQLite/PostgreSQL
│   │   └── production.py     # Gunicorn, HTTPS redirects, HSTS, hardened security
│   ├── urls.py               # Root URL dispatcher + /api/v1/health/ check
│   ├── asgi.py               # Channels routing (HTTP + WebSocket)
│   ├── wsgi.py               # WSGI entrypoint for Gunicorn
│   └── celery.py             # Celery app + autodiscover_tasks
│
├── users/                    # Custom user model + auth flows
│   ├── models.py             # CustomUser: email-based auth, platform roles
│   ├── serializers.py        # Register, login, profile serializers
│   ├── views.py              # Registration, login, logout, token refresh, profile
│   ├── urls.py               # /api/v1/users/ routes
│   ├── authentication.py     # CustomJWTAuthentication (Redis jti validation)
│   ├── tokens.py             # Custom JWT claims (roles, org_id)
│   ├── middleware.py         # OrgContextMiddleware
│   ├── permissions.py        # IsPlatformAdmin, IsVerifiedUser, etc.
│   ├── throttles.py          # Per-user + burst rate limiting
│   ├── signals.py            # Post-save hooks (email verification)
│   ├── tasks.py              # Async email tasks (Celery)
│   ├── adapters.py           # django-allauth adapter override
│   └── managers.py           # CustomUserManager (email as USERNAME_FIELD)
│
├── organizations/            # Multi-tenant org management
│   ├── models.py             # Organization, Membership, Subscription
│   ├── serializers.py        # Org CRUD, membership management
│   ├── views.py              # Org endpoints + member management
│   ├── urls.py               # /api/v1/organizations/ routes
│   ├── permissions.py        # IsOrgOwner, IsOrgManager, IsOrgMember
│   ├── signals.py            # Auto-sync platform role on org create
│   └── tasks.py              # Subscription expiry checks
│
└── api/                      # Tours & Bookings MVP
    ├── models.py             # Tour, Booking models
    ├── serializers.py        # Tour + Booking serializers
    ├── views.py              # TourViewSet, BookingViewSet
    └── urls.py               # /api/v1/ router
```

### 6.2 Settings System

Settings are split across three files using **python-decouple** for env-var injection:

- **`base.py`** — shared across all environments: installed apps, middleware stack,
  auth backends, Celery configuration, S3 storage, Sentry, logging
- **`development.py`** — extends base with:
  - `DEBUG = True`
  - Conditional database: if `DATABASE_URL` is set → PostgreSQL; else → SQLite
  - Conditional cache: if `REDIS_URL` is set → Redis; else → `locmem://`
  - Conditional Celery: if no Redis → `CELERY_TASK_ALWAYS_EAGER = True` (tasks run inline)
  - django-debug-toolbar, CORS allow-all
- **`production.py`** — extends base with:
  - `DEBUG = False`
  - PostgreSQL required (no SQLite fallback)
  - `SECURE_SSL_REDIRECT = True`, HSTS headers, `SECURE_PROXY_SSL_HEADER`
  - `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True`

`DJANGO_SETTINGS_MODULE` is set to `config.settings.development` by default
(in `manage.py`) and overridden to `config.settings.production` via the Docker
`environment:` block in `docker-compose.prod.yml`.

### 6.3 Authentication & JWT

AdoraTrip uses a **dual-token JWT scheme** hardened with Redis-based invalidation:

```
POST /api/v1/users/login/
→ Response:
  - access_token (in JSON body)  — 60 min, stored in JS memory
  - refresh_token (HttpOnly cookie, SameSite=Lax) — 30 days
```

**Token lifecycle:**

1. **Login** → `CustomTokenObtainPairView` issues access + refresh tokens.
   Refresh token is set as `HttpOnly` cookie (not readable by JavaScript).
2. **Authenticated requests** → `Authorization: Bearer <access_token>` header.
   `CustomJWTAuthentication` validates the JWT signature, then checks Redis:
   `jti:<user_id>:<jti>` must exist (not be in the blocklist).
3. **Refresh** → `POST /api/v1/users/token/refresh/` reads the cookie,
   issues a new access token.
4. **Logout** → Server adds the `jti` to a Redis blocklist (`jti:blocklist:<jti>`
   with TTL = token remaining lifetime). Future requests with the same token
   are rejected even if the signature is valid.
5. **Social login** → `django-allauth` handles OAuth2 (Google, Facebook planned).
   On successful social auth, the same JWT issuance flow applies.

**JWT custom claims** (added via `CustomTokenObtainPairSerializer`):
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "platform_role": "PARTNER_OWNER",
  "org_id": "uuid-or-null",
  "is_verified": true
}
```

**Email verification:**
- On registration, a verification email is sent asynchronously via Celery.
- Unverified users can log in but have limited API access
  (`IsVerifiedUser` permission class blocks sensitive endpoints).

### 6.4 RBAC Permission System

AdoraTrip has **two orthogonal permission dimensions**:

#### Platform Roles (PlatformRole)

Applied to the user globally across the platform:

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform control, can suspend users and orgs |
| `PLATFORM_STAFF` | Platform moderation and user management |
| `PARTNER_OWNER` | Owns one or more partner organizations |
| `PARTNER_MANAGER` | Manages a partner org (bookings, inventory, pricing) |
| `PARTNER_STAFF` | Staff member of a partner org (view bookings, check-in) |
| `PARTNER_FINANCE` | Finance access within a partner org (revenue reports) |
| `LOCAL_GUIDE` | Licensed local guide profile |
| `TRANSPORT_PROVIDER` | Vehicle fleet / transport company |
| `TRAVELER` | Standard registered user (default on registration) |

#### Organization Roles (OrganizationRole)

Applied to a user's membership within a specific `Organization`:

| Role | Permissions |
|------|------------|
| `OWNER` | Full org control, billing, delete org |
| `MANAGER` | Manage members, products, bookings |
| `STAFF` | Manage products, view bookings |
| `FINANCE` | View bookings, manage payouts |

#### Permission classes (DRF)

| Class | Grants access to |
|-------|----------------|
| `IsAuthenticatedAndVerified` | Any active user with verified email |
| `IsSuperAdmin` | `SUPER_ADMIN` only |
| `IsPlatformStaff` | `SUPER_ADMIN` or `PLATFORM_STAFF` |
| `IsAnyPartnerRole` | Any `PARTNER_*` platform role |
| `IsLocalGuide` | `LOCAL_GUIDE` role |
| `IsTransportProvider` | `TRANSPORT_PROVIDER` role |
| `IsBookingOwner` | Object-level: traveler who made the booking |

Org context is injected by `OrgContextMiddleware` from the `X-Organization-Id`
request header and stored in `request.org` (lazily resolved via `OrgContextMiddleware`).

### 6.5 Organization Multi-Tenancy

Each `Organization` (tour operator, hotel, guide agency) is a first-class
multi-tenant entity:

```
Organization
├── name, slug, org_type (TOUR_OPERATOR / HOTEL / GUIDE_AGENCY / TRANSPORT)
├── subscription_tier (FREE / STARTER / PROFESSIONAL / ENTERPRISE)
├── subscription_expires_at
└── Membership (through table)
    ├── user → CustomUser
    ├── role (OWNER / MANAGER / STAFF / FINANCE)
    └── is_active
```

**Auto-role sync signal:** When a user becomes an org `OWNER`, a post-save signal
on `Membership` automatically upgrades their `platform_role` to `PARTNER_OWNER`
if it was previously `TRAVELER`.

**Subscription tiers** control feature access:
- `FREE` — basic listing
- `STARTER` — analytics, up to 50 products
- `PROFESSIONAL` — API access, unlimited products, priority support
- `ENTERPRISE` — white-label, dedicated account manager

### 6.6 API Reference

All endpoints are prefixed with `/api/v1/`. The API follows REST conventions and
returns JSON. Authentication uses `Authorization: Bearer <token>` unless noted.

Full interactive documentation:
- **Swagger UI:** `/api/docs/`
- **ReDoc:** `/api/docs/redoc/`
- **OpenAPI schema (JSON):** `/api/schema/`

#### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health/` | None | DB connectivity check. Returns `{"status":"ok"}` (200) or `{"status":"error"}` (503) |

#### Authentication (`/api/v1/auth/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register/` | None | Register new user |
| POST | `/api/v1/auth/login/` | None | Login → access token + refresh cookie |
| POST | `/api/v1/auth/logout/` | Bearer | Invalidate tokens (Redis blocklist) |
| POST | `/api/v1/auth/token/refresh/` | Cookie | Exchange refresh cookie → new access token |
| GET/PATCH/DELETE | `/api/v1/auth/me/` | Bearer | Get / update profile / deactivate account |
| GET | `/api/v1/auth/csrf/` | None | Set CSRF cookie (call on app load) |
| POST | `/api/v1/auth/email/verify/` | None | Verify email with one-time token |
| POST | `/api/v1/auth/email/resend-verification/` | Bearer | Resend verification email |
| POST | `/api/v1/auth/password/reset/request/` | None | Request password reset link |
| POST | `/api/v1/auth/password/reset/confirm/` | None | Confirm reset with token + new password |
| POST | `/api/v1/auth/password/change/` | Bearer | Change password (logged-in users) |
| GET | `/api/v1/auth/admin/users/` | Bearer + PlatformStaff | List all users |
| PATCH | `/api/v1/auth/admin/users/{id}/` | Bearer + SuperAdmin | Update user role / suspend |

**Register example:**

```bash
curl -X POST http://localhost/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "traveler@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Dara",
    "last_name": "Sok"
  }'
```

**Login example:**

```bash
curl -X POST http://localhost/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "traveler@example.com", "password": "SecurePass123!"}'

# Response:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
#   "user": { "id": "uuid", "email": "...", "platform_role": "TRAVELER" }
# }
```

#### Organizations (`/api/v1/organizations/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/organizations/` | Bearer | List organizations (filtered by membership) |
| POST | `/api/v1/organizations/` | Bearer | Create organization (caller becomes OWNER) |
| GET | `/api/v1/organizations/{id}/` | Bearer + Org-Member | Get org details |
| PUT/PATCH | `/api/v1/organizations/{id}/` | Bearer + Org-Owner | Update org |
| DELETE | `/api/v1/organizations/{id}/` | Bearer + Org-Owner | Delete org |
| GET | `/api/v1/organizations/{id}/members/` | Bearer + Org-Member | List members |
| POST | `/api/v1/organizations/{id}/members/` | Bearer + Org-Manager | Invite member |
| PATCH | `/api/v1/organizations/{id}/members/{uid}/` | Bearer + Org-Manager | Update member role |
| DELETE | `/api/v1/organizations/{id}/members/{uid}/` | Bearer + Org-Manager | Remove member |

#### Tours & Bookings (`/api/v1/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tours/` | None | List all tours (public) |
| POST | `/api/v1/tours/` | Bearer + Partner | Create tour |
| GET | `/api/v1/tours/{id}/` | None | Get tour details |
| PUT/PATCH | `/api/v1/tours/{id}/` | Bearer + Partner | Update tour |
| DELETE | `/api/v1/tours/{id}/` | Bearer + Partner | Delete tour |
| GET | `/api/v1/bookings/` | Bearer | List user's bookings |
| POST | `/api/v1/bookings/` | Bearer | Create booking |
| GET | `/api/v1/bookings/{id}/` | Bearer | Get booking details |
| PATCH | `/api/v1/bookings/{id}/` | Bearer | Update booking status |

#### Django Admin

`/admin/` — Full Django admin panel for platform administrators.
Accessible with `SUPER_ADMIN` or `PLATFORM_ADMIN` platform role.

### 6.7 Background Jobs (Celery)

Celery is configured with 4 named queues:

| Queue | Purpose |
|-------|---------|
| `default` | General async tasks |
| `emails` | Email sending (SendGrid / SMTP) |
| `payments` | Stripe webhook processing, payouts |
| `reports` | Analytics, PDF report generation |

**Worker command:**
```bash
celery -A config.celery worker --loglevel=info --concurrency=4 \
  -Q default,emails,payments,reports
```

**Registered tasks:**

| Task | Queue | Trigger |
|------|-------|---------|
| `users.tasks.send_verification_email` | emails | Post-registration |
| `users.tasks.send_password_reset_email` | emails | Password reset request |
| `organizations.tasks.check_subscription_expiry` | default | Scheduled (Beat) |
| `organizations.tasks.send_subscription_expiry_warning` | emails | 7 days before expiry |

**Celery Beat** runs scheduled tasks using `DatabaseScheduler` — schedules are
stored in PostgreSQL and editable via Django Admin → "Periodic Tasks".

In local development without Redis, `CELERY_TASK_ALWAYS_EAGER = True` executes
tasks synchronously inline (no worker needed).

### 6.8 WebSocket / Real-time

Django Channels is configured with Redis as the channel layer backend.
Daphne serves the ASGI application on port 8001 (routed via Nginx at `/ws/`).

**Channel layer config (`base.py`):**
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    }
}
```

**Planned WebSocket consumers (Phase 2+):**
- Booking status updates (real-time confirmation)
- Chat between traveler and tour operator
- Live tour availability updates
- Notification delivery

### 6.9 Security Layers

| Layer | Implementation |
|-------|---------------|
| Brute-force protection | django-axes (locks after 5 failures, 1h cooldown) |
| Rate limiting | DRF throttling (anon: 100/day, user: 1000/day, auth burst: 10/min) |
| JWT invalidation | Redis blocklist (jti-based, TTL-aware) |
| CORS | django-cors-headers (explicit origins in prod) |
| CSRF | Django CSRF middleware + cookie-based protection |
| SQL injection | Django ORM parameterized queries |
| XSS | DRF renders JSON only; no template HTML |
| Headers | `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, HSTS (prod) |
| Secrets | python-decouple reads from `.env`, never hardcoded |
| Container | Non-root user (UID 1000), read-only source in production |

---

## 7. Frontend

### 7.1 Next.js Application Layout

The frontend is built on **Materio MUI Admin Template** customized for AdoraTrip.
It uses the Next.js **App Router** with route groups for layout isolation.

```
src/
├── app/
│   ├── layout.tsx                      # Root: font, emotion cache, MUI theme
│   ├── globals.css                     # Tailwind directives + CSS variables
│   ├── (dashboard)/                    # Authenticated shell layout
│   │   ├── layout.tsx                  # Sidebar + header + content area
│   │   ├── home/page.tsx               # Dashboard home
│   │   └── about/page.tsx              # About page
│   └── (blank-layout-pages)/           # Clean layout (no sidebar)
│       ├── layout.tsx
│       └── login/page.tsx              # Login form
│
├── @core/                              # Template core system
│   ├── theme/                          # MUI theme provider + overrides
│   ├── hooks/                          # useSettings, useColorScheme, etc.
│   ├── styles/                         # Shared CSS-in-JS styles
│   └── utils/                          # serverUrl, layoutClasses, etc.
│
├── @layouts/                           # Layout shell components
│   ├── VerticalLayout.tsx              # Sidebar + header composition
│   ├── HorizontalLayout.tsx            # Top-nav layout variant
│   └── BlankLayout.tsx                 # Minimal wrapper for auth pages
│
├── @menu/                              # Navigation menu system
│   ├── components/                     # MenuItem, SubMenu, MenuSection
│   └── hooks/                          # useMenu, useVerticalNav
│
├── components/                         # AdoraTrip-specific components
├── configs/
│   ├── themeConfig.ts                  # Theme mode, RTL, skin, layout settings
│   └── navigationConfig.ts             # Sidebar nav items
├── data/                               # Static data, navigation definitions
├── types/                              # Shared TypeScript interfaces
├── utils/                              # API client, formatters, helpers
└── views/                              # Full page-level view components
```

### 7.2 UI Stack

**MUI v7** provides the component library (Button, DataGrid, Dialog, etc.).

**Tailwind CSS v4** handles utility classes with:
- Logical properties for RTL support (`tailwindcss-logical`)
- PostCSS integration via `@tailwindcss/postcss`

**Iconify** provides 200,000+ icons from 100+ icon sets. Icons are bundled
at build time via `tsx src/assets/iconify-icons/bundle-icons-css.ts`.

**Emotion** handles CSS-in-JS (required by MUI). Configured with SSR-safe
cache via `@emotion/cache` and `@mui/material-nextjs`.

### 7.3 Routing

The App Router uses **route groups** (folders in parentheses) to apply different
layouts to page groups without affecting the URL:

| URL | Layout | Page |
|-----|--------|------|
| `/home` | Dashboard (sidebar + header) | Dashboard overview |
| `/about` | Dashboard (sidebar + header) | About page |
| `/login` | Blank (no sidebar) | Login form |
| `/*` (unmatched) | — | 404 not found |

### 7.4 Configuration

**`next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',    // Required: produces self-contained server for Docker
  // ... other config
}
```

`output: 'standalone'` produces a `/.next/standalone/` directory containing
`server.js` and all necessary files to run Next.js without `node_modules` in
the Docker runner stage — reducing the production image from ~1GB to ~200MB.

**Environment variables accessed by Next.js:**

| Variable | Used for |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for REST API calls |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint |
| `NODE_ENV` | Enables production optimizations |
| `NEXT_TELEMETRY_DISABLED=1` | Disables Next.js telemetry |

Variables prefixed with `NEXT_PUBLIC_` are embedded into the client bundle at
build time. Server-only env vars (without prefix) are available only in
Server Components and API routes.

---

## 8. Docker Infrastructure

### 8.1 Services

| Service | Image / Build | Port | Purpose |
|---------|--------------|------|---------|
| `db` | postgres:16-alpine | 5432 | PostgreSQL primary database |
| `redis` | redis:7-alpine | 6379 | Cache + broker + channel layer |
| `api` | Backend/Dockerfile (dev/prod) | 8000 | Django HTTP (Gunicorn/runserver) |
| `websocket` | Backend/Dockerfile (dev/prod) | 8001 | Daphne ASGI / WebSocket |
| `celery_worker` | Backend/Dockerfile | — | Celery task worker |
| `celery_beat` | Backend/Dockerfile | — | Celery periodic scheduler |
| `frontend` | Frontend/Dockerfile (dev/runner) | 3000 | Next.js app server |
| `nginx` | nginx:1.25-alpine | 80, 443 | Reverse proxy + static files |
| `flower` | Backend/Dockerfile | 5555 | Celery task monitor *(tools profile)* |
| `pgadmin` | dpage/pgadmin4:8 | 5050 | PostgreSQL GUI *(tools profile)* |

**Start order (via `depends_on`):**
```
db (healthy) → api (healthy) → websocket, celery_worker, celery_beat
redis (healthy) → api
api → frontend, nginx
```

### 8.2 Volumes

| Volume | Purpose |
|--------|---------|
| `adoratrip_postgres_data` | PostgreSQL data files |
| `adoratrip_redis_data` | Redis AOF persistence |
| `adoratrip_static` | Django `collectstatic` output (shared api ↔ nginx) |
| `adoratrip_media` | User-uploaded media files (shared api ↔ nginx) |
| `adoratrip_frontend_node_modules` | Isolated container node_modules |
| `adoratrip_frontend_next_cache` | Persistent Next.js build cache (.next/) |
| `adoratrip_pgadmin` | pgAdmin config persistence |

### 8.3 Nginx Routing

```
Nginx (port 80)
├── /static/         → Django staticfiles volume (direct file serve)
├── /media/          → Django mediafiles volume (direct file serve)
├── /ws/             → websocket:8001 (Daphne, WebSocket upgrade)
├── /api/            → api:8000 (Django, HTTP/1.1 keepalive)
├── /admin/          → api:8000 (Django admin)
├── /api/v1/health/  → api:8000 (health check, access_log off)
└── /                → frontend:3000 (Next.js, WS upgrade for HMR)
```

Production (`nginx.prod.conf`) additionally:
- Port 80 → 301 redirect to HTTPS
- Port 443 → TLS with Let's Encrypt certificates
- HSTS with preload
- OCSP stapling
- Rate limiting zones (`api_limit`: 20r/s, `auth_limit`: 5r/m)
- Security headers: `Strict-Transport-Security`, `Content-Security-Policy`

### 8.4 Multi-Stage Builds

#### Backend Dockerfile (4 stages)

```
base (python:3.12-slim)
 └── Install system deps with BuildKit apt cache
      └── builder
           └── Compile ALL packages to /wheels (pip cache + no gcc in prod)
                ├── development
                │    └── pip install from wheels + dev extras, hot-reload volume mount
                └── production (fresh python:3.12-slim)
                     └── pip install --no-index --find-links=/wheels
                          → No build tools, minimal attack surface
                          → HEALTHCHECK: curl /api/v1/health/
                          → Non-root user (adoratrip, UID 1000)
                          → ENTRYPOINT: /entrypoint.sh (wait DB → migrate → collectstatic → superuser)
                          → CMD: gunicorn
```

#### Frontend Dockerfile (5 stages)

```
base (node:20-alpine)
 └── corepack enable (pnpm), ENV PNPM_HOME
      └── deps
           └── pnpm fetch (downloads to store with BuildKit cache)
                └── pnpm install --offline (installs from store)
                     └── builder
                          └── COPY source + pnpm build
                               └── runner (fresh node:20-alpine)
                                    └── Copy .next/standalone only (~200MB)
                                         → Non-root user (nodejs, UID 1001)
                                         → HEALTHCHECK: wget localhost:3000
                          └── development (back to deps)
                               └── pnpm dev --turbopack
```

**BuildKit cache mounts used:**
- `--mount=type=cache,target=/var/cache/apt,sharing=locked` — apt packages
- `--mount=type=cache,target=/root/.cache/pip` — pip packages
- `--mount=type=cache,id=adoratrip-pnpm,target=/root/.local/share/pnpm/store,sharing=locked` — pnpm store

All Dockerfiles require BuildKit: `# syntax=docker/dockerfile:1.4` header.
Docker Compose v2 enables BuildKit automatically.

---

## 9. Development Workflows

### 9.1 Database Migrations

```bash
# Create migrations after model changes
docker compose exec api python manage.py makemigrations

# Apply migrations
docker compose exec api python manage.py migrate

# Show migration status
docker compose exec api python manage.py showmigrations

# Squash migrations for a specific app
docker compose exec api python manage.py squashmigrations users 0001 0005
```

### 9.2 Creating a Superuser

```bash
# Interactive
docker compose exec api python manage.py createsuperuser

# Or set env vars for automatic creation (production entrypoint.sh):
# DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_USERNAME
```

### 9.3 Django Shell

```bash
# Open interactive shell with all models auto-imported
docker compose exec api python manage.py shell_plus

# Run a one-off script
docker compose exec api python manage.py shell -c "
from users.models import CustomUser
print(CustomUser.objects.count(), 'users')
"
```

### 9.4 Celery Tasks

```bash
# View active workers
docker compose exec celery_worker celery -A config.celery inspect active

# Run a task manually
docker compose exec api python manage.py shell -c "
from users.tasks import send_verification_email
send_verification_email.delay(user_id='uuid-here')
"

# Monitor task history (Flower UI)
# http://localhost:5555  (requires --profile tools)
```

### 9.5 Adding a New Django App

```bash
# 1. Create the app
docker compose exec api python manage.py startapp hotels

# 2. Add to INSTALLED_APPS in config/settings/base.py:
#    'hotels.apps.HotelsConfig',

# 3. Create models in hotels/models.py
# 4. Create and apply migrations:
docker compose exec api python manage.py makemigrations hotels
docker compose exec api python manage.py migrate

# 5. Register URLs in config/urls.py:
#    path('api/v1/', include('hotels.urls')),

# 6. Register admin in hotels/admin.py
# 7. Add Celery tasks in hotels/tasks.py (if needed)
# 8. Add signals in hotels/signals.py + register in hotels/apps.py
```

### 9.6 Running Tests

```bash
# Run all tests
docker compose exec api python manage.py test

# Run tests for a specific app
docker compose exec api python manage.py test users.tests

# With coverage
docker compose exec api coverage run manage.py test
docker compose exec api coverage report
docker compose exec api coverage html    # → htmlcov/index.html

# Frontend lint
docker compose exec frontend pnpm lint
docker compose exec frontend pnpm format
```

---

## 10. Planned Modules (Phases 2-4)

### Phase 2 — Core Travel Modules

| Module | Description |
|--------|-------------|
| **Hotels** | Property listings, room types, availability calendar |
| **Tours** | Full tour management (itineraries, pricing tiers, media gallery) |
| **Guides** | Licensed guide profiles, language specialties, availability |
| **Transport** | Vehicle fleet, driver profiles, transfer bookings |

### Phase 3 — Commerce & Payments

| Module | Description |
|--------|-------------|
| **Booking Engine** | Unified booking flow with conflict detection, hold/confirm/cancel states |
| **Payments** | Stripe Checkout + webhooks, multi-currency, partner payouts via Stripe Connect |
| **Reviews** | Post-stay rating system, moderation queue, response workflow |
| **Notifications** | In-app + push + email + SMS (Twilio) notification dispatch |

### Phase 4 — Intelligence & Scale

| Module | Description |
|--------|-------------|
| **Tourism Info** | Cambodia POI database, route planning, offline map tiles |
| **Search** | Elasticsearch-powered full-text search with geo filters |
| **Analytics** | Partner revenue dashboards, platform KPI reporting |
| **Mobile API** | React Native companion app API layer |

---

## 11. Troubleshooting

### Services won't start

```bash
# Check all service statuses
docker compose ps

# View logs for a specific service
docker compose logs -f api
docker compose logs -f db
docker compose logs -f frontend
```

### Database connection errors

```bash
# Verify PostgreSQL is healthy
docker compose exec db pg_isready -U adoratrip_user -d adoratrip_db

# Check DATABASE_URL is set correctly in .env
echo $DATABASE_URL

# Connect directly to the database
docker compose exec db psql -U adoratrip_user -d adoratrip_db
```

### Migrations fail

```bash
# Check for conflicting migrations
docker compose exec api python manage.py showmigrations

# Reset a specific app's migrations (development only — data loss)
docker compose exec api python manage.py migrate <app_name> zero
docker compose exec api python manage.py migrate <app_name>
```

### Static files not loading

```bash
# Run collectstatic manually
docker compose exec api python manage.py collectstatic --noinput

# Check static volume is mounted
docker compose exec nginx ls /app/staticfiles/
```

### Frontend hot-reload not working

The development compose mounts `./Frontend:/app` with a separate named volume
for `node_modules`. If HMR stops working:

```bash
# Restart the frontend service
docker compose restart frontend

# Or rebuild if package.json changed
docker compose up --build frontend
```

### Celery tasks not running

```bash
# Check worker is alive
docker compose exec celery_worker celery -A config.celery inspect ping

# Check Redis connection
docker compose exec redis redis-cli ping

# View task queue depth
docker compose exec redis redis-cli llen celery
```

### Port already in use

```bash
# Find what's using a port (example: 8000)
netstat -ano | findstr :8000   # Windows
lsof -i :8000                  # macOS / Linux

# Change port mapping in docker-compose.yml:
#   ports:
#     - "8001:8000"    # host:container
```

### Full reset (development)

```bash
# Stop everything and remove all volumes (WARNING: deletes all data)
docker compose down -v

# Remove built images
docker compose down --rmi all

# Start fresh
docker compose up --build
```

---

*AdoraTrip — Discover Cambodia, Simplified.*
