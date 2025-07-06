# Multi-stage build for ForeverCore GDPS
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    tzdata

# Set timezone
ENV TZ=UTC

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ===== DEVELOPMENT STAGE =====
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3010

# Start development server
CMD ["npm", "run", "boot"]

# ===== BUILD STAGE =====
FROM base AS builder

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (if you have a build script)
# RUN npm run build

# ===== PRODUCTION STAGE =====
FROM node:18-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    tzdata \
    dumb-init

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gdps -u 1001

# Create app directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

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
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "server.ts"]

# ===== BUN VARIANT =====
FROM oven/bun:1.0-alpine AS bun-production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    dumb-init

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