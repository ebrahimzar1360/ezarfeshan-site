'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const LABELS: Record<Theme, string> = {
  light: 'روشن',
  dark: 'تیره',
  system: 'سیستم',
}

/** Kept in sync with the inline script in app/layout.tsx. */
function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  try {
    if (theme === 'system') localStorage.removeItem('theme')
    else localStorage.setItem('theme', theme)
  } catch {
    // private mode / blocked storage — the choice just won't persist
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem('theme')
    } catch {
      stored = null
    }
    setTheme(stored === 'light' || stored === 'dark' ? stored : 'system')
    setReady(true)
  }, [])

  function cycle() {
    const order: Theme[] = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length] ?? 'system'
    setTheme(next)
    apply(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      // Until the effect runs we don't know the stored value; announcing a guess
      // to a screen reader would be worse than staying quiet for one frame.
      aria-label={ready ? `تم: ${LABELS[theme]} — برای تغییر کلیک کن` : 'تغییر تم'}
      title={ready ? `تم: ${LABELS[theme]}` : undefined}
      className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text"
    >
      <span aria-hidden className="text-200 font-medium">
        {ready ? (theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐') : '◐'}
      </span>
    </button>
  )
}
