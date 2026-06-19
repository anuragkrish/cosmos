# -------------- Base --------------

FROM node:22.17.1-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV COREPACK_ENABLE=1
RUN corepack enable
RUN corepack use pnpm@9.12.0

# -------------- Deps --------------\

FROM base AS deps
RUN apk add --no-cache --virtual .build-deps python3 make g++ libc6-compat

ARG NPM_TOKEN

ENV NPM_TOKEN=$NPM_TOKEN

RUN echo "legacy-peer-deps=true" >>.npmrc
RUN echo "registry=https://registry.yarnpkg.com/" >>.npmrc
RUN echo "@headout:registry=https://npm.pkg.github.com" >>.npmrc
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >>.npmrc
RUN echo "always-auth=true" >>.npmrc

COPY package.json pnpm-lock.yaml* sync-espeon-deps.ts ./
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile && apk del .build-deps


# -------------- Builder --------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_ENV
COPY .env.${APP_ENV} .env.production
RUN pnpm build

# -------------- Runner --------------
FROM base AS runner
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

ARG APP_ENV
ARG IMAGE_TAG

ENV NODE_ENV=production

ENV APP_ENV=$APP_ENV \
    IMAGE_TAG=$IMAGE_TAG

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]
