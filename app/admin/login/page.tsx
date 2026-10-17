import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { currentUser } from '@/lib/auth'

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
  // currentUser, not auth(): a disabled account still carries a valid cookie,
  // and bouncing it back to /admin would loop with the layout's redirect here.
  if (await currentUser()) redirect('/admin')

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
