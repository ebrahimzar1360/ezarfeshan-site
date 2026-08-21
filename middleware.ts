import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Gate for /admin.
 *
 * Only checks that a session cookie exists — it does not verify the signature.
 * That is deliberate: middleware runs on the edge runtime where the Argon2 and
 * database code cannot go. The real check happens in the admin layout, which is
 * a server component with full access to `auth()`. This is a cheap redirect for
 * the common case, not the security boundary.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ['/admin/:path*'],
}
