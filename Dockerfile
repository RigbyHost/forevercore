# ForeverCore GDPS Hosting Platform - Modern TypeScript with Fastify
FROM oven/bun:1.2-alpine AS production

# Install system dependencies with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            python3 \
            mysql-client \
            redis \
            curl \
            tzdata \
            dumb-init && break || \
        (echo "Attempt $i failed, retrying in 5 seconds..." && sleep 5); \
    done

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S forevercore -u 1001

# Create app directory
WORKDIR /app

# Copy new package configuration
COPY package.remake.json ./package.json
COPY tsconfig.remake.json ./tsconfig.json
COPY drizzle.config.ts ./

# Install dependencies
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN bun install --production

# Copy source code
COPY src/ ./src/
COPY panelui/ ./panelui/

# Build admin panel
WORKDIR /app/panelui
RUN bun install && bun run build

# Back to main app
WORKDIR /app

# Create necessary directories for hosting
RUN mkdir -p logs data config drizzle

# Set proper ownership
RUN chown -R forevercore:nodejs /app

# Switch to non-root user
USER forevercore

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3010/ || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3010

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the modern Fastify server
CMD ["bun", "run", "src/server.ts"]