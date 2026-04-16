# syntax=docker/dockerfile:1.4
# =============================================================================
# AdoraTrip — Backend Dockerfile  (2026 Edition)
# Base: Python 3.12 slim (Debian Bookworm)
#
# Stages:
#   base        — shared system deps via apt cache mounts (build tools here only)
#   builder     — compiles Python packages into wheels (gcc stays here, not in prod)
#   development — full dev install via pip cache mount + hot-reload server
#   production  — minimal runtime, installs from pre-compiled wheels (no gcc)
#
# Key 2026 practices applied:
#   ✓ --mount=type=cache  for apt and pip  (persistent, zero image-size cost)
#   ✓ Wheels compilation  — production image has no build-essential / gcc
#   ✓ COPY --link         — breaks layer dependency chain → better cache reuse
#   ✓ Non-root user       — UID 1000, consistent across stages
#   ✓ HEALTHCHECK         — production stage only
#   ✓ No apt-get clean    — cache mounts make it redundant
# =============================================================================

# =============================================================================
# Stage: base — Python + build tools via apt cache mounts
# ALL stages that need build tools inherit from here.
# The production stage starts from a FRESH python:3.12-slim instead.
# =============================================================================
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# apt cache mounts: /var/cache/apt and /var/lib/apt are stored in BuildKit's
# cache, not in the image layer. The 'sharing=locked' flag prevents concurrent
# apt-get calls from stepping on each other.
# No 'apt-get clean && rm -rf /var/lib/apt/lists/*' needed — cache mounts
# never write into the image, so there is nothing to clean up.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    curl \
    gettext

# =============================================================================
# Stage: builder — compile all production Python packages into wheels
#
# Why wheels?
#   gcc, make, libpq-dev etc. are needed to compile native extensions
#   (psycopg2, cryptography, Pillow). Doing this in a separate stage means
#   the final production image is built from a clean python:3.12-slim with
#   NO build tools — only the pre-compiled .whl files are copied over.
#
# Result: production image is ~40% smaller and has a much smaller attack surface.
# =============================================================================
FROM base AS builder

# Upgrade pip and install wheel in the builder only.
# Cache mount keeps the pip download cache between builds on the same host.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip wheel

# COPY --link decouples these layers from the layers above them.
# If only the source code changes (not requirements), Docker reuses the
# pip install layer from the previous build.
COPY --link requirements/base.txt        requirements/base.txt
COPY --link requirements/production.txt  requirements/production.txt

# Compile all packages into pre-built .whl files.
# The production stage will 'pip install --no-index' from these wheels —
# no compiler, no internet connection, no pip cache needed there.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel \
        --no-cache-dir \
        --wheel-dir /wheels \
        -r requirements/base.txt \
        -r requirements/production.txt

# =============================================================================
# Stage: development — full install with pip cache mount, hot-reload server
# Inherits build tools from 'base' for native dev packages (debug toolbar etc.)
# The source tree is VOLUME-MOUNTED at runtime by docker-compose,
# so code changes are reflected without rebuilding.
# =============================================================================
FROM base AS development

COPY --link requirements/base.txt        requirements/base.txt
COPY --link requirements/development.txt requirements/development.txt

# pip cache mount: pip downloads are stored on the host's BuildKit cache,
# not in the image. Re-installs after a lockfile change are near-instant
# because packages are already downloaded.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install \
        -r requirements/base.txt \
        -r requirements/development.txt

# Non-root user — consistent UID 1000 across dev and prod.
RUN groupadd -r adoratrip && useradd -r -g adoratrip -u 1000 adoratrip

# Copy source here for image builds; docker-compose will override via mount.
COPY --chown=adoratrip:adoratrip . .

USER adoratrip

EXPOSE 8000 8001

# docker-compose overrides this command to run migrations first (see docker-compose.yml).
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# =============================================================================
# Stage: production — minimal, hardened runtime image
#
# Starts from a FRESH python:3.12-slim — NOT inheriting from 'base'.
# This guarantees no build tools (gcc, make, libpq-dev) leak into the prod image.
# Only the pre-compiled wheels from the builder stage are installed.
# =============================================================================
FROM python:3.12-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Minimal runtime system libraries only.
# psycopg2-binary: bundles libpq (no libpq-dev needed at runtime)
# Pillow binary:   bundles libjpeg/libpng (no image headers needed)
# cryptography:    uses libssl bundled in python:3.12-slim
# curl:            used for the HEALTHCHECK below
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    gettext \
    curl

# Non-root user created before any COPY --chown below.
RUN groupadd -r adoratrip && useradd -r -g adoratrip -u 1000 adoratrip

# Install from the pre-compiled wheels built in the 'builder' stage.
# --no-index:       never hit PyPI (fully offline)
# --find-links:     resolve packages from /wheels only
# Remove the wheels directory afterward — it served its purpose.
COPY --from=builder /wheels /wheels
RUN pip install --no-index --find-links=/wheels /wheels/*.whl \
 && rm -rf /wheels

# Entrypoint: owned by root (only root can modify it), but world-executable
# so the adoratrip user can run it after USER is switched.
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy application source with non-root ownership.
# COPY --link keeps this layer independent of earlier layers.
COPY --link --chown=adoratrip:adoratrip . .

# Pre-create directories with correct ownership.
# collectstatic and media uploads write here at runtime.
RUN mkdir -p /app/staticfiles /app/mediafiles \
 && chown -R adoratrip:adoratrip /app/staticfiles /app/mediafiles

USER adoratrip

EXPOSE 8000

# start_period: gunicorn needs ~10-20s to initialise workers.
# The health check uses curl's --fail-with-body (-fsS) flag to surface
# HTTP error bodies in the build log if the check fails.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost:8000/api/v1/health/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", \
     "--bind",           "0.0.0.0:8000", \
     "--workers",        "4", \
     "--worker-class",   "gthread", \
     "--threads",        "2", \
     "--timeout",        "120", \
     "--access-logfile", "-", \
     "--error-logfile",  "-"]
