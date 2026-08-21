import { defineConfig, env } from 'prisma/config'

/**
 * Prisma 7 moved the connection URL out of schema.prisma: the datasource block
 * declares only the provider, and the URL lives here. Migrations and
 * introspection read it from this file; the runtime client gets it through a
 * driver adapter in lib/db.ts.
 *
 * Prisma 7 also stopped loading .env automatically. process.loadEnvFile is
 * built into Node 20.12+, so this needs no dotenv dependency.
 */
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile('.env')
  } catch {
    // no .env in this environment — the variable is expected to be set already
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
