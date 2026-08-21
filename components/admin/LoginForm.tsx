'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormField, inputClass } from '@/components/ui/FormField'

/**
 * The error message never says which half was wrong.
 *
 * "No account with that address" tells an attacker which addresses exist, which
 * is exactly the information a single-account admin login should not give away.
 * The authorize() callback is timed to match for the same reason.
 */
export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(initialError)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)

    const data = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
      redirect: false,
    })

    if (result?.error) {
      setError('ایمیل یا گذرواژه درست نیست. اگر چند بار اشتباه زدی، کمی صبر کن و دوباره تلاش کن.')
      setBusy(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormField id="email" label="ایمیل" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          dir="ltr"
          required
          className={`latin ${inputClass}`}
        />
      </FormField>

      <FormField id="password" label="گذرواژه" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          className={`latin ${inputClass}`}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-300 font-medium text-text">
          <span aria-hidden className="me-1.5 text-accent">
            ▲
          </span>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full rounded-md bg-solid-bg text-300 font-medium text-solid-text transition-colors duration-150 hover:bg-solid-bg-hover disabled:opacity-60"
      >
        {busy ? 'در حال ورود…' : 'ورود'}
      </button>

      <p className="text-200 leading-normal text-text-subtle">
        حساب از خط فرمان ساخته می‌شود: <span className="latin">npm run admin:create</span>.
        مسیر بازیابی گذرواژه با ایمیل وجود ندارد — برای دری که یک نفر از آن رد می‌شود،
        راه دوم یعنی راه دوم برای نفوذ.
      </p>
    </form>
  )
}
