# syntax=docker/dockerfile:1.4
# =============================================================================
# AdoraTrip — Frontend Dockerfile  (2026 Edition)
# Base: Node.js 20 LTS Alpine
# Package manager: pnpm (via corepack — version pinned in package.json)
#
# Stages:
#   base        — shared Node + pnpm setup (avoids repeating this in every stage)
#   deps        — pnpm fetch + install with persistent store cache mount
#   builder     — TypeScript compile + Next.js standalone bundle
#   runner      — minimal production image (~150-200 MB vs ~1.5 GB)
#   development — hot-reload dev server with pnpm store cache mount
#
# Key 2026 practices applied:
#   ✓ --mount=type=cache (id=adoratrip-pnpm) — persistent pnpm store shared
#                                               across ALL stages and builds
#   ✓ pnpm fetch + install --offline          — separates download from install;
#                                               second build is near-instant
#   ✓ COPY --link                             — decouples lockfile layers from
#                                               code layers → better cache reuse
#   ✓ output: 'standalone' in next.config.ts  — zero node_modules in production
#   ✓ Non-root user (UID 1001)                — Node.js convention
#   ✓ HEALTHCHECK with wget                   — wget is in Alpine by default,
#                                               no extra apk needed
#   ✓ Single 'base' stage                     — all derived stages are lean
# =============================================================================

# =============================================================================
# Stage: base — shared foundation for all stages
# Sets up Node 20, pnpm via corepack, and a single working directory.
# Every subsequent stage starts FROM base instead of FROM node:20-alpine
# directly — avoids repeating the apk add + corepack enable in each stage.
# =============================================================================
FROM node:20-alpine AS base

# libc6-compat: required by some native npm addons on Alpine/musl.
RUN apk add --no-cache libc6-compat

# corepack: built into Node 20, manages pnpm without a separate install.
# It will honour the 'packageManager' field in package.json if present.
RUN corepack enable

# PNPM_HOME lets corepack write pnpm's shim to a predictable, PATH'd location.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# =============================================================================
# Stage: deps — download and install all dependencies
#
# Two-step pnpm approach (2026 recommended pattern):
#   1. 'pnpm fetch'           — downloads packages into the pnpm store
#                               (network-heavy step, cache-mountable)
#   2. 'pnpm install --offline' — installs from the local store only
#                               (zero network; reads from the cache mount)
#
# The cache mount (id=adoratrip-pnpm) persists the store between Docker builds
# on the SAME host. A lockfile change invalidates this layer but the packages
# themselves are still cached — only deltas are re-downloaded.
#
# Performance impact on a cold build:     ~2-3 min  (first time)
# Performance impact on a warm rebuild:   ~5-15 sec (deps unchanged)
# =============================================================================
FROM base AS deps

# COPY --link: the COPY layer is independent of the base layer chain.
# If only source code changes (not lockfiles), this whole layer is reused.
COPY --link package.json pnpm-lock.yaml .npmrc ./

# Step 1: Download all packages into the store.
# 'id=adoratrip-pnpm' names this cache so it is shared with the dev stage.
RUN --mount=type=cache,id=adoratrip-pnpm,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm fetch --frozen-lockfile

# Step 2: Install from the store (--offline: never hit the network).
RUN --mount=type=cache,id=adoratrip-pnpm,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --offline

# =============================================================================
# Stage: builder — TypeScript compile + Next.js production bundle
#
# Copies node_modules from deps instead of installing again.
# Produces .next/standalone — a self-contained Node server that requires
# NO node_modules at runtime (Next.js copies only what it needs).
# =============================================================================
FROM base AS builder

# Pull in fully-installed node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source tree.
COPY . .

# Disable telemetry during Docker build — prevents a network call to Vercel's
# telemetry service that would fail in air-gapped CI environments.
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time public variables: baked into the static JS bundle at build time.
# Pass via docker-compose build.args or 'docker build --build-arg'.
# At runtime, use NEXT_PUBLIC_* env vars in docker-compose for overrides.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG BASEPATH

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
    BASEPATH=${BASEPATH}

# 'next build' reads output: 'standalone' from next.config.ts and produces:
#   .next/standalone/         — complete mini-server (server.js + minimal deps)
#   .next/static/             — hashed CSS/JS chunks
#   public/                   — unchanged static assets
RUN pnpm run build

# =============================================================================
# Stage: runner — minimal production image
#
# Starts from a FRESH node:20-alpine (not inheriting node_modules or build tools).
# Only three COPY directives are needed — the standalone output is complete.
#
# Image size breakdown:
#   node:20-alpine base:      ~170 MB
#   .next/standalone/:         ~30 MB
#   .next/static + public/:    ~10 MB
#   Total:                    ~210 MB  (vs ~1.5 GB with full node_modules)
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user: mirrors the official Next.js Docker example.
# UID 1001 avoids collisions with the default 'node' user (UID 1000).
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy ONLY what the standalone server needs.
# server.js: the auto-generated Next.js production server entry point.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets (hashed CSS/JS chunks) — served by the standalone server itself.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public directory: favicon, images, robots.txt, etc.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# wget is included in Alpine's busybox — no extra apk add needed.
# --spider: HEAD request only (does not download the body).
# --quiet:  suppress output; only the exit code matters to HEALTHCHECK.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Next.js standalone output generates server.js at the container root.
CMD ["node", "server.js"]

# =============================================================================
# Stage: development — hot-reload dev server
#
# The source tree is VOLUME-MOUNTED by docker-compose at runtime — code changes
# are reflected instantly without a container rebuild.
# node_modules live inside a named Docker volume (see docker-compose.yml),
# so they persist across restarts and are not shadowed by the host mount.
#
# Uses the same named pnpm cache (id=adoratrip-pnpm) as the deps stage —
# packages are already downloaded, so pnpm install completes in seconds.
# =============================================================================
FROM base AS development

COPY --link package.json pnpm-lock.yaml .npmrc ./

# Reuse the same pnpm store populated by the deps stage.
RUN --mount=type=cache,id=adoratrip-pnpm,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm fetch --frozen-lockfile \
 && pnpm install --frozen-lockfile --offline

# Source is overridden by the volume mount in docker-compose; this COPY just
# ensures the image is self-sufficient if run without a compose override.
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

# 'pnpm dev' resolves to 'next dev --turbopack' via package.json#scripts.
CMD ["pnpm", "dev"]
