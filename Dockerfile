# Simple Bun production build for ForeverCore GDPS
FROM oven/bun:1.2-alpine AS production

# Install only essential system dependencies with retry logic
RUN for i in 1 2 3 4 5; do \
        apk add --no-cache \
            python3 \
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

# Copy package files and install dependencies
COPY package*.json ./
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN bun install --production

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

# Start the application
CMD ["bun", "run", "-r", "tsconfig-paths/register", "server.ts"]