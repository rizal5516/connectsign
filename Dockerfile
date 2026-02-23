# ==========================
# Stage 1: Base Image
# ==========================
FROM node:20-slim AS base

# Install dependencies (termasuk sertifikat SSL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ==========================
# Stage 2: Dependencies
# ==========================
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==========================
# Stage 3: Build Stage
# ==========================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==========================
# Stage 4: Production Runner (OpenShift-friendly)
# ==========================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy static and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ======= OpenShift compliance =======
# OpenShift menggunakan UID acak -> pastikan group 0 writable
RUN chgrp -R 0 /app && chmod -R g=u /app

# Tidak buat user baru, biarkan OpenShift inject arbitrary UID
USER 1001

EXPOSE 3000

CMD ["node", "server.js"]
