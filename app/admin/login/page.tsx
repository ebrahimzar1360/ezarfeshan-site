import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { auth } from '@/lib/auth'

export const metadata = { title: 'ورود', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/**
 * Deliberately not inside app/admin/(protected): that group's layout redirects
 * unauthenticated visitors here, and a login page rendering inside it would
 * redirect to itself forever.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const session = await auth()
  if (session?.user) redirect('/admin')

  const { next, error } = await searchParams

  return (
    <div className="min-h-dvh bg-bg-sunken">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-6">
        <div className="w-full">
          <div className="gold-marker mb-8">
            <h1 className="text-700">ورود به مدیریت</h1>
          </div>
          <LoginForm
            next={next ?? '/admin'}
            initialError={error ? 'ایمیل یا گذرواژه درست نیست.' : undefined}
          />
        </div>
      </div>
    </div>
  )
}
