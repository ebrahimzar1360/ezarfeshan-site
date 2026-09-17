import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** `/articles/page/1` and `/topics/<slug>/page/1`, which are page 1 spelled the long way. */
const PAGE_ONE = /^(\/articles|\/topics\/[^/]+)\/page\/1$/

/**
 * Two jobs.
 *
 * 1. Canonicalise page 1 of a paginated list. The page component calls
 *    `redirect()` for this, but a redirect thrown from inside a page render
 *    does not survive in this app — it comes back as a 200 carrying the 404
 *    body, the same way `notFound()` does (docs/OPEN-QUESTIONS.md §16). A
 *    middleware redirect is issued before any rendering starts and does emit a
 *    real 307, which is why this lives here rather than in the route.
 *
 * 2. Gate for /admin.
 *
 * Only checks that a session cookie exists — it does not verify the signature.
 * That is deliberate: middleware runs on the edge runtime where the Argon2 and
 * database code cannot go. The real check happens in the admin layout, which is
 * a server component with full access to `auth()`. This is a cheap redirect for
 * the common case, not the security boundary.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pageOne = PAGE_ONE.exec(pathname)
  if (pageOne) {
    return NextResponse.redirect(new URL(pageOne[1] ?? '/articles', request.url), 308)
  }

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  if (pathname === '/admin/login') return NextResponse.next()

  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token')

  if (!hasSession) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/articles/page/:page', '/topics/:slug/page/:page'],
}
