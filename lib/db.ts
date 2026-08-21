import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Prisma 7 requires a driver adapter — the client no longer opens its own
 * connection from a URL in the schema. PrismaPg wraps node-postgres, so
 * pooling is configured here rather than in the connection string.
 *
 * The global cache exists because Next.js re-evaluates modules on every hot
 * reload in development; without it each edit leaks a pool and Postgres runs
 * out of connections within a few minutes.
 */

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and start the local ' +
      'cluster with: npm run db init'
  )
}

function createClient() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
