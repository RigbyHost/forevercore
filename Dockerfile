# Multi-stage build for ForeverCore GDPS
FROM oven/bun:1.2-alpine AS base

# Install system dependencies with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            python3 \
            make \
            g++ \
            git \
            curl \
            tzdata && break || \
        (echo "Attempt $i failed, retrying in 5 seconds..." && sleep 5); \
    done

# Set timezone
ENV TZ=UTC

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install --production

# ===== DEVELOPMENT STAGE =====
FROM base AS development

# Install all dependencies (including dev)
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3010

# Start development server
CMD ["bun", "run", "boot"]

# ===== BUILD STAGE =====
FROM base AS builder

# Install all dependencies for building
RUN bun install

# Copy source code
COPY . .

# Build TypeScript (if you have a build script)
# RUN bun run build

# ===== PRODUCTION STAGE =====
FROM oven/bun:1.2-alpine AS production

# Install runtime dependencies only with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            curl \
            tzdata \
            dumb-init && break || \
        (echo "Attempt $i failed, retrying in 5 seconds..." && sleep 5); \
    done

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gdps -u 1001

# Create app directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN bun install --production

# Copy built application
COPY --from=builder /app .

# Create necessary directories
RUN mkdir -p logs data/levels data/accounts GDPS_DATA config

# Set proper ownership
RUN chown -R gdps:nodejs /app

# Switch to non-root user
USER gdps

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3010/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "-r", "tsconfig-paths/register", "server.ts"]

# ===== BUN VARIANT =====
FROM oven/bun:1.2-alpine AS bun-production

# Install system dependencies including bash/sh with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            curl \
            tzdata \
            dumb-init \
            bash && break || \
        (echo "Attempt $i failed, retrying in 5 seconds..." && sleep 5); \
    done

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gdps -u 1001

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json bun.lockb* ./

# Install dependencies with Bun
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs data/levels data/accounts GDPS_DATA config

# Set proper ownership
RUN chown -R gdps:nodejs /app

# Switch to non-root user
USER gdps

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3010/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start with Bun
CMD ["bun", "run", "-r", "tsconfig-paths/register", "server.ts"]