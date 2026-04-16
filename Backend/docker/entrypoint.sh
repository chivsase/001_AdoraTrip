#!/bin/sh
# =============================================================================
# AdoraTrip — Docker Entrypoint (Production)
# Used only in the 'production' Dockerfile stage.
# Development containers (runserver) skip this and run commands directly.
#
# Sequence:
#   1. Wait for PostgreSQL to be ready
#   2. Run database migrations
#   3. Collect static files
#   4. Create superuser if it doesn't exist
#   5. Hand off to CMD (gunicorn or daphne)
# =============================================================================

set -e

# ---------------------------------------------------------------------------
# 1. Wait for PostgreSQL
# Polls until psycopg2 can open a connection. DATABASE_URL must be set.
# ---------------------------------------------------------------------------
echo "[entrypoint] Waiting for PostgreSQL..."

max_retries=30
retry_count=0

until python - <<'EOF'
import os, sys
import psycopg2

url = os.environ.get("DATABASE_URL", "")
if not url:
    print("[entrypoint] DATABASE_URL is not set — cannot connect to database", file=sys.stderr)
    sys.exit(1)

try:
    conn = psycopg2.connect(url)
    conn.close()
    print("[entrypoint] PostgreSQL is ready.")
except Exception as exc:
    print(f"[entrypoint] Not ready yet: {exc}", file=sys.stderr)
    sys.exit(1)
EOF
do
  retry_count=$((retry_count + 1))
  if [ "$retry_count" -ge "$max_retries" ]; then
    echo "[entrypoint] ERROR: PostgreSQL did not become ready after ${max_retries} attempts. Aborting."
    exit 1
  fi
  echo "[entrypoint] Retrying in 2s... (${retry_count}/${max_retries})"
  sleep 2
done

# ---------------------------------------------------------------------------
# 2. Run migrations
# ---------------------------------------------------------------------------
echo "[entrypoint] Running database migrations..."
python manage.py migrate --noinput

# ---------------------------------------------------------------------------
# 3. Collect static files
# ---------------------------------------------------------------------------
echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear

# ---------------------------------------------------------------------------
# 4. Create superuser (idempotent — skips if email already exists)
# ---------------------------------------------------------------------------
echo "[entrypoint] Ensuring superuser exists..."
python - <<EOF
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.production"))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email    = os.environ.get("DJANGO_SUPERUSER_EMAIL",    "admin@adoratrip.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "change-me-in-production")

if User.objects.filter(email=email).exists():
    print(f"[entrypoint] Superuser '{email}' already exists — skipping.")
else:
    User.objects.create_superuser(email=email, password=password)
    print(f"[entrypoint] Superuser '{email}' created.")
EOF

# ---------------------------------------------------------------------------
# 5. Hand off to CMD (gunicorn / daphne)
# ---------------------------------------------------------------------------
echo "[entrypoint] Starting application: $*"
exec "$@"
