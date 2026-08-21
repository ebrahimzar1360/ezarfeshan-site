'use client'

import { signOutAdmin } from '@/lib/admin/actions'

export function SignOutButton() {
  return (
    <form action={signOutAdmin}>
      <button
        type="submit"
        className="text-200 text-text-subtle underline underline-offset-4 hover:text-text"
      >
        خروج
      </button>
    </form>
  )
}
