# Multi-stage build for ForeverCore Admin Panel (Next.js)
FROM oven/bun:1.2-alpine AS base

# Install system dependencies with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            libc6-compat \
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

# ===== DEPENDENCIES STAGE =====
FROM base AS deps

# Install dependencies
RUN bun install

# ===== BUILDER STAGE =====
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ===== PRODUCTION STAGE =====
FROM oven/bun:1.2-alpine AS production

# Install runtime dependencies with retry logic
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
RUN adduser -S nextjs -u 1001

# Create app directory
WORKDIR /app

# Copy package.json for production dependencies
COPY package*.json ./
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN bun install --production

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

# Install system dependencies with retry logic
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
RUN adduser -S nextjs -u 1001

# Create app directory
WORKDIR /app

# Copy package files and dependencies from builder
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

# Start with Node.js (standalone Next.js doesn't need Bun at runtime)
CMD ["node", "server.js"]