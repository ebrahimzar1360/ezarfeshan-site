import { verify } from '@node-rs/argon2'
import { cache } from 'react'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from './db'
import { rateLimit } from './rate-limit'
import { can, isRole, type Permission, type Role } from './admin/permissions'

/**
 * Admin authentication.
 *
 * There is no public signup and no password reset by email. The first ADMIN is
 * created from the command line (`npm run admin:create`); further accounts are
 * created by an ADMIN in /admin/users, which also sets roles and resets
 * passwords. An email reset flow would be a second way in nobody needs.
 *
 * JWT sessions keep the middleware free of a database round trip, but the JWT
 * is not trusted for authorisation: requireUser() re-reads the account on every
 * admin request, so a disabled user or a changed role takes effect at once
 * rather than when the 8-hour cookie expires.
 */

const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  pages: { signIn: '/admin/login', error: '/admin/login' },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'ایمیل', type: 'email' },
        password: { label: 'گذرواژه', type: 'password' },
      },
      async authorize(raw) {
        const email = typeof raw?.email === 'string' ? raw.email.trim().toLowerCase() : ''
        const password = typeof raw?.password === 'string' ? raw.password : ''
        if (!email || !password) return null

        // Throttled per address. Without this a single account with one password
        // is a standing invitation to a dictionary attack.
        const limited = await rateLimit(`login:${email}`, { limit: 8, windowSeconds: 900 })
        if (!limited.ok) return null

        const user = await db.user.findUnique({ where: { email } })

        // Verify even when the user is missing, against a throwaway hash, so a
        // wrong address and a wrong password take the same time to answer.
        const hash = user?.passwordHash ?? DUMMY_HASH
        let valid = false
        try {
          valid = await verify(hash, password)
        } catch {
          valid = false
        }

        if (!user || !valid || !user.active) return null

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        token.role = (user as { role?: string }).role ?? 'EDITOR'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.uid ?? '')
        ;(session.user as { role?: string }).role = String(token.role ?? 'EDITOR')
      }
      return session
    },
  },
})

/**
 * A REAL Argon2id hash, of a random string nobody will ever type. Verifying
 * against it costs the same as verifying a genuine password — which is the
 * whole point: a missing account and a wrong password must take the same time,
 * or the response time tells an attacker which addresses have accounts.
 *
 * An invented hash-shaped string does not work. verify() rejects it on parse in
 * a fraction of the time and the timing gap reappears; that was the original
 * bug here, caught by tools/audit/admin.mjs.
 *
 * Parameters must stay in step with tools/db/create-admin.mjs.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$LSvAP/IIKeYQYAnLWei78w$q7U60hNSaPn9ak/yK4NIG/gli+O0M5aSFsj5Ulmv274'

export type AdminUser = { id: string; email: string; name: string; role: Role }

/**
 * The signed-in account as the database has it now, or null. Cached per
 * request so a page and the actions it renders share one lookup.
 */
export const currentUser = cache(async (): Promise<AdminUser | null> => {
  const session = await auth()
  const id = session?.user?.id
  if (!id) return null
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true },
  })
  if (!user || !user.active || !isRole(user.role)) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
})

/** Throws unless an active account is signed in. */
export async function requireUser(): Promise<AdminUser> {
  const user = await currentUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  return user
}

/** Throws unless the signed-in account holds `permission`. Every admin action calls this. */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await requireUser()
  if (!can(user.role, permission)) throw new Error('FORBIDDEN')
  return user
}

/** Kept for existing callers: any signed-in, active account. */
export const requireAdmin = requireUser
