# ======================
# Stage 1: Backend Dependencies
# ======================
FROM node:20-alpine AS backend-deps

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ======================
# Stage 2: Production Image
# ======================
FROM node:20-alpine

LABEL maintainer="Headscale UI"
LABEL description="Modern dashboard for Headscale using REST API"

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend dependencies
COPY --from=backend-deps --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules

# Copy backend source
COPY --chown=nodejs:nodejs backend/src ./backend/src
COPY --chown=nodejs:nodejs backend/healthcheck.js ./backend/
COPY --chown=nodejs:nodejs backend/package.json ./backend/

# Copy frontend static files
# Since we're using vanilla JS, just copy the public folder directly
COPY --chown=nodejs:nodejs frontend/public ./backend/public

# Ensure proper permissions (storage folder already exists from COPY)
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/backend/healthcheck.js || exit 1

# Set working directory to backend source
WORKDIR /app/backend/src

# Start the application
CMD ["node", "index.js"]
