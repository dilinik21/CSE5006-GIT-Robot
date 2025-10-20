# --- Build stage ---
FROM mcr.microsoft.com/devcontainers/javascript-node:20 AS builder
WORKDIR /app

# Prisma DB URL used during generate/db push
ENV PRISMA_DB_URL="file:/app/prisma/dev.db"

# 1) Install deps WITHOUT running lifecycle scripts (postinstall)
COPY package*.json ./
RUN npm ci --ignore-scripts

# 2) Copy the rest of the source (including prisma/)
COPY . .

# 3) Now that prisma/ is present, run prisma steps
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# 4) Build Next.js (needs devDependencies present)
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

# Install production deps only
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000
CMD ["npm", "start"]
