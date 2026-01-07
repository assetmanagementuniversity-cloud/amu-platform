# AMU API Dockerfile
# Multi-stage build for production deployment

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files for all workspaces
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY packages/ai/package*.json ./packages/ai/

# Install all dependencies
RUN npm ci --workspace=packages/shared --workspace=packages/database --workspace=packages/ai --workspace=apps/api

# Copy source files
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY packages/ai/ ./packages/ai/
COPY apps/api/ ./apps/api/

# Build packages and API
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=packages/ai
RUN npm run build --workspace=apps/api

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY packages/ai/package*.json ./packages/ai/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=packages/shared --workspace=packages/database --workspace=packages/ai --workspace=apps/api

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start API
CMD ["node", "apps/api/dist/index.js"]
