/**
 * Sets an ADMIN account's password from an Argon2id hash, not a password.
 *
 *   node tools/db/set-admin-hash.mjs you@example.com '<argon2id hash>'
 *
 * Used by .github/workflows/admin-password.yml, which cannot be handed a
 * plain password without it passing through GitHub. The hash is made on the
 * owner's side with the same parameters as create-admin.mjs; a hash of a long
 * random password is safe to pass around, the password itself is not.
 *
 * Creates the account if it does not exist, and re-activates it if disabled.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

try {
  process.loadEnvFile('.env')
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

const [, , emailArg, hashArg] = process.argv
const email = emailArg?.trim().toLowerCase() ?? ''
const passwordHash = hashArg?.trim() ?? ''

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('usage: node tools/db/set-admin-hash.mjs <email> <argon2id hash>')
  process.exit(1)
}
// same parameters as create-admin.mjs and DUMMY_HASH in lib/auth.ts
if (!/^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/.test(passwordHash)) {
  console.error('not an Argon2id hash with the expected parameters')
  process.exit(1)
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
const existing = await db.user.findUnique({ where: { email } })
await db.user.upsert({
  where: { email },
  update: { passwordHash, role: 'ADMIN', active: true },
  create: { email, name: 'ابراهیم زرفشان', passwordHash, role: 'ADMIN' },
})
console.log(existing ? `password replaced for ${email}` : `admin created: ${email}`)
await db.$disconnect()
