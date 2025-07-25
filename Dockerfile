# Multi-stage build for ForeverCore API (Bun)
FROM oven/bun:1.2-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    tzdata

# Set timezone
ENV TZ=UTC

# Create python venv
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install youtube-dl
RUN pip install --no-cache-dir youtube-dl

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

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

# Build project
RUN bun run build:core

# ===== PRODUCTION STAGE =====
FROM oven/bun:1.2-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    tzdata \
    dumb-init

# Set timezone
ENV TZ=UTC

# Create python venv
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install youtube-dl
RUN pip install --no-cache-dir youtube-dl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001

# Create app directory
WORKDIR /app

# Copy package.json for production dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder --chown=bun:nodejs /app/dist ./dist
COPY --from=builder --chown=bun:nodejs /app/package.json ./

# Set proper ownership
RUN chown -R bun:nodejs /app

# Switch to non-root user
USER bun

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3010/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3010

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "boot"]