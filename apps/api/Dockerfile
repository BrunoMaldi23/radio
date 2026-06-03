FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
COPY apps/api ./apps/api
RUN npm run prisma:generate
RUN npm run api:build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY prisma ./prisma
RUN npm run prisma:generate
COPY --from=build /app/apps/api/dist ./apps/api/dist
RUN mkdir -p /app/uploads/images
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node apps/api/dist/main.js"]
