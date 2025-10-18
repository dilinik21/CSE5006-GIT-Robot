# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# If you use TypeScript, ensure it builds Next.js
RUN npm run build

# --- Run stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev && npm cache clean --force

# Expose Next.js default port
EXPOSE 3000
CMD ["npm","start"]
