import { verify } from '@node-rs/argon2'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from './db'
import { rateLimit } from './rate-limit'

/**
 * Admin authentication.
 *
 * One account, one password. There is no signup route, no password reset by
 * email, and no user management screen — the account is created from the
 * command line (`npm run admin:create`). A reset flow would be a second way in
 * for a door only one person ever uses.
 *
 * JWT sessions rather than database sessions: with a single user there is
 * nothing to gain from a sessions table, and a stateless cookie keeps the
 * middleware free of a database round trip on every admin request.
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

        if (!user || !valid) return null

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

/** Throws unless a session exists. Every admin page and action calls this. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('UNAUTHENTICATED')
  return session.user
}
