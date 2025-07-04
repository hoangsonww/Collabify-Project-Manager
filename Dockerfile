# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Make npm ignore peer‐dep conflicts
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Copy everything and install dependencies
COPY . .
RUN npm ci

# Build the Next.js application
RUN npm run build

# 2) Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy all built output and runtime files
COPY --from=builder /app /app

# Expose the default Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
