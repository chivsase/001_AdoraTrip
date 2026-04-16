#!/bin/sh
# ============================================================
# AdoraTrip — Docker Entrypoint Script
# Runs migrations, collects static files, then starts server
# ============================================================

set -e

echo "==> Waiting for database..."
until python -c "
import os, psycopg2
try:
    psycopg2.connect(os.environ.get('DATABASE_URL'))
    print('Database ready')
except Exception as e:
    print(f'Database not ready: {e}')
    exit(1)
"; do
  echo "    Database not ready — retrying in 2s..."
  sleep 2
done

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='${DJANGO_SUPERUSER_EMAIL:-admin@adoratrip.com}').exists():
    User.objects.create_superuser(
        email='${DJANGO_SUPERUSER_EMAIL:-admin@adoratrip.com}',
        password='${DJANGO_SUPERUSER_PASSWORD:-admin123}',
    )
    print('Superuser created')
else:
    print('Superuser already exists')
"

echo "==> Starting application..."
exec "$@"
