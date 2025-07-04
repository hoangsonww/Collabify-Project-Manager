# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy everything and install dependencies
COPY . .
RUN npm ci

# Build the Next.js application
RUN npm run build

# 2) Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app

# Ensure production mode
ENV NODE_ENV=production

# Copy all files (including .next, public, node_modules, next.config.js, etc.) from builder
COPY --from=builder /app /app

# Expose the default Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
