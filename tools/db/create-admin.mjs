/**
 * Creates or updates the single admin account.
 *
 *   npm run admin:create -- you@example.com "نام" "گذرواژه"
 *
 * There is no signup route and no password reset by email, so this is the only
 * way in. Running it again with the same address replaces the password, which
 * is the reset flow.
 *
 * The password is taken as an argument rather than prompted because this shell
 * runs non-interactively. That puts it in shell history — change it after first
 * login if that matters, or clear the history line.
 */

import { hash } from '@node-rs/argon2'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

process.loadEnvFile('.env')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const [, , emailArg, nameArg, passwordArg] = process.argv

if (!emailArg || !passwordArg) {
  console.error('usage: npm run admin:create -- <email> <name> <password>')
  process.exit(1)
}

const email = emailArg.trim().toLowerCase()
const name = nameArg?.trim() || 'مدیر'
const password = passwordArg

if (password.length < 12) {
  console.error(
    `گذرواژه باید دست‌کم ۱۲ کاراکتر باشد (الان ${password.length} است).\n` +
      'این تنها در ورودی سایت است — کوتاهش نکن.'
  )
  process.exit(1)
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// A stopped database surfaces as a bare ECONNREFUSED with a Prisma stack trace,
// which says nothing about what to do. Check first and say it plainly.
try {
  await db.$queryRaw`SELECT 1`
} catch (error) {
  // Prisma wraps the cause, so the code is on the error object rather than in
  // its message — String(error) only yields "PrismaClientKnownRequestError:".
  const refused =
    error?.code === 'ECONNREFUSED' ||
    error?.cause?.code === 'ECONNREFUSED' ||
    String(error?.message ?? '').includes('ECONNREFUSED')
  console.error(
    refused
      ? 'دیتابیس در دسترس نیست.\n\n' +
          '  اول روشنش کن:  npm run db start\n' +
          '  بعد دوباره همین دستور را بزن.\n\n' +
          `  (تلاش برای اتصال به ${connectionString.replace(/:[^:@]*@/, ':***@')})`
      : `اتصال به دیتابیس ناموفق بود:\n\n  ${String(error).split('\n')[0]}`
  )
  process.exit(1)
}

// Argon2id with parameters from the OWASP cheat sheet: 19 MiB, 2 passes.
const passwordHash = await hash(password, {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
})

const existing = await db.user.findUnique({ where: { email } })

const user = await db.user.upsert({
  where: { email },
  update: { passwordHash, name, role: 'ADMIN' },
  create: { email, name, passwordHash, role: 'ADMIN' },
})

console.log(existing ? `گذرواژهٔ ${user.email} به‌روز شد.` : `کاربر ادمین ساخته شد: ${user.email}`)
console.log('ورود: /admin/login')

await db.$disconnect()
