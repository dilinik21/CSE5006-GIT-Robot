# --- Build stage ---
FROM node:20 AS builder
WORKDIR /app

# Prisma needs DB url during generate/db push
ENV PRISMA_DB_URL="file:/app/prisma/dev.db"

# 1) Install *all* deps (incl. dev) for build
COPY package*.json ./
RUN npm ci

# 2) Copy source
COPY . .

# 3) Generate Prisma client + create SQLite schema
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# 4) Build Next.js (needs devDeps like tailwind/postcss/lightningcss)
RUN npm run build


# --- Run stage (production) ---
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_DB_URL="file:/app/prisma/dev.db"

# Copy only what we need to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Install prod deps only (sqlite3 & sequelize remain in dependencies)
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000
CMD ["npm", "start"]
