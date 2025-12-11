# ======================
# Stage 1: Build Frontend
# ======================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy frontend source
COPY frontend/ ./

# Build frontend (if using a build step, e.g., React/Vue)
# For now, we'll just prepare static files
RUN if [ -f "package.json" ] && grep -q '"build"' package.json; then \
      npm run build; \
    fi

# ======================
# Stage 2: Backend Dependencies
# ======================
FROM node:20-alpine AS backend-deps

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ======================
# Stage 3: Production Image
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

# Copy frontend build (if exists, otherwise just copy source)
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/build ./backend/public 2>/dev/null || \
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/dist ./backend/public 2>/dev/null || \
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/public ./backend/public 2>/dev/null || \
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/src ./backend/public

# Create storage directory with proper permissions
RUN mkdir -p /app/backend/src/storage && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/backend/healthcheck.js || exit 1

# Start the application
CMD ["node", "/app/backend/src/index.js"]
