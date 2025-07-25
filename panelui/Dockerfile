# Multi-stage build for ForeverCore Admin Panel (Next.js)
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    tzdata

# Set timezone
ENV TZ=UTC

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock* ./

# ===== DEPENDENCIES STAGE =====
FROM base AS deps

# Install dependencies
RUN bun install --frozen-lockfile

# ===== BUILDER STAGE =====
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ===== PRODUCTION STAGE =====
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    dumb-init

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create app directory
WORKDIR /app

# Copy package.json for production dependencies
COPY package*.json ./
RUN bun install --frozen-lockfile

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# ===== BUN VARIANT =====
FROM oven/bun:1.2-alpine AS bun-production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    dumb-init

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json bun.lock* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js application with Bun
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Set proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start with Bun
CMD ["bun", "run", "start"]