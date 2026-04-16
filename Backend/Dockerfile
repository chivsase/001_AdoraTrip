# ============================================================
# AdoraTrip — Dockerfile
# Multi-stage build: development + production
# Base: Python 3.12 slim
# ============================================================

# ----------------------------------------------------------
# Stage 1: Base — shared dependencies
# ----------------------------------------------------------
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    curl \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements/base.txt requirements/base.txt
RUN pip install --upgrade pip && pip install -r requirements/base.txt

# ----------------------------------------------------------
# Stage 2: Development
# ----------------------------------------------------------
FROM base AS development

COPY requirements/development.txt requirements/development.txt
RUN pip install -r requirements/development.txt

COPY . .

EXPOSE 8000 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ----------------------------------------------------------
# Stage 3: Production
# ----------------------------------------------------------
FROM base AS production

# Production dependencies
COPY requirements/production.txt requirements/production.txt
RUN pip install -r requirements/production.txt

# Create non-root user for security
RUN groupadd -r adoratrip && useradd -r -g adoratrip adoratrip

# Copy project files
COPY --chown=adoratrip:adoratrip . .

# Create directories for static and media files
RUN mkdir -p /app/staticfiles /app/mediafiles && \
    chown -R adoratrip:adoratrip /app/staticfiles /app/mediafiles

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER adoratrip

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "gthread", \
     "--threads", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
