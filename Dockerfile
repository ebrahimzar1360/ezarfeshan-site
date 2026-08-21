# Multi-stage build. The runtime image carries the standalone server, the static
# assets and the Prisma engines — no source, no dev dependencies, no npm.

# ---------- dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Prisma's engines need glibc compatibility on Alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma
# npm ci needs the lockfile to match package.json exactly; a drifted lockfile
# should fail the build rather than be silently resolved
RUN npm ci --ignore-scripts && npx prisma generate

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next build runs generateStaticParams, which queries the database. A build-time
# URL is supplied so that step has something to connect to; the real URL comes
# from the environment at runtime.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# never run the server as root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
# assets/ holds the OG font, which is read from disk at runtime and must not be
# public. outputFileTracingIncludes copies it into .next/standalone.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# migrations and the Prisma CLI, so the container can migrate itself on deploy
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

USER nextjs
EXPOSE 3000

# Checks the database, not just that the process is alive — a server that cannot
# reach Postgres serves nothing useful and should be restarted.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.json()).then(j=>process.exit(j.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
