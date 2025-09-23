# Multi-stage Dockerfile for Next.js (Node 18 Alpine)

FROM node:18-alpine AS deps
WORKDIR /app

# Install system deps if needed (e.g., for sharp). Alpine has musl; Next can work without extra libs for most cases
RUN apk add --no-cache libc6-compat

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --omit=dev=false

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate before build
RUN npx prisma generate

# Build Next.js app
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only necessary output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma client needs schema at runtime for edge cases; already copied

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]


