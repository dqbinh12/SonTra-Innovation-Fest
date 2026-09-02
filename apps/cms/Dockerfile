FROM node:24-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat vips-dev
WORKDIR /app

# ---- dependencies ----
FROM base AS deps
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev python3

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cms/package.json apps/cms/

RUN pnpm install --frozen-lockfile --filter @sif/cms...

# ---- build ----
FROM base AS builder
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cms apps/cms

RUN pnpm --filter @sif/cms build

# ---- runtime ----
FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat vips-dev

ENV NODE_ENV=production
ENV PORT=1337

RUN addgroup -g 1001 -S nodejs \
    && adduser -S strapi -u 1001

WORKDIR /app

COPY --from=builder --chown=strapi:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:nodejs /app/apps/cms ./apps/cms

WORKDIR /app/apps/cms

# Volume mountpoints must exist in the image and be owned by the runtime user,
# otherwise Docker creates them root-owned and Strapi cannot write.
RUN mkdir -p .tmp public/uploads && chown -R strapi:nodejs .tmp public/uploads

USER strapi

EXPOSE 1337

CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]