# =============================================================================
# AdoraTrip — Next.js Frontend Dockerfile
# Base: Node.js 20 LTS Alpine
# Package manager: pnpm (mirrors pnpm-lock.yaml in project)
#
# Stages:
#   1. deps        — install ALL dependencies (dev + prod)
#   2. builder     — compile TypeScript, bundle with Next.js
#   3. runner      — minimal production image (standalone output)
#   4. development — hot-reload dev server
# =============================================================================

# =============================================================================
# Stage 1: deps — dependency installation layer
# Cached independently so code changes don't reinstall packages
# =============================================================================
FROM node:20-alpine AS deps

# libc6-compat needed for some native npm packages on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable pnpm via corepack (built into Node 20)
RUN corepack enable pnpm

# Copy only the dependency manifests first (for layer caching)
COPY package.json pnpm-lock.yaml ./

# --frozen-lockfile ensures the lockfile is never updated inside Docker
# This catches lockfile drift between local and CI environments
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2: builder — compile & bundle the application
# =============================================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

WORKDIR /app

# Pull in node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source tree
COPY . .

# Disable Next.js telemetry during build (no network calls)
ENV NEXT_TELEMETRY_DISABLED=1

# Build args that are baked into the static bundle at build time.
# Pass these via docker-compose build args or --build-arg flags.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG BASEPATH

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV BASEPATH=${BASEPATH}

# Run the production build
# next.config.ts must have output: 'standalone' for the runner stage to work
RUN pnpm run build

# =============================================================================
# Stage 3: runner — minimal production image
# Uses Next.js standalone output: no node_modules required at runtime
# Image is ~300 MB instead of ~1.5 GB
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the standalone server bundle (requires output: 'standalone' in next.config)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets (CSS, JS chunks, images) — served by Next.js itself
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the public folder (favicons, images, robots.txt, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output creates a self-contained server.js at the root
CMD ["node", "server.js"]

# =============================================================================
# Stage 4: development — hot-reload dev server
# Mounted at runtime via docker-compose volume for instant feedback
# =============================================================================
FROM node:20-alpine AS development

RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies (node_modules live in a named Docker volume,
# so they survive container restarts without re-installing)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source — will be overridden by the volume mount in docker-compose
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

# --turbopack: fast incremental bundler (enabled in package.json dev script)
CMD ["pnpm", "dev"]
