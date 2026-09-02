# Build context is the monorepo root: docker build -f apps/cms/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat vips-dev
WORKDIR /app

# ---- dependencies ----
FROM base AS deps
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev python3
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cms/package.json apps/cms/
RUN pnpm install --frozen-lockfile --filter @sif/cms...

# ---- build (compiles the admin panel) ----
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cms apps/cms
RUN pnpm --filter @sif/cms build

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=1337
RUN addgroup -g 1001 -S nodejs && adduser -S strapi -u 1001

COPY --from=builder --chown=strapi:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:nodejs /app/apps/cms ./apps/cms

WORKDIR /app/apps/cms
USER strapi
EXPOSE 1337
CMD ["node", "node_modules/.bin/strapi", "start"]
