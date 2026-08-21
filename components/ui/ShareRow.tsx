'use client'

import { useState } from 'react'

/**
 * Share targets. Plain links rather than an SDK: the platform widgets each pull
 * a third-party script, which costs more than the feature is worth and puts a
 * tracker on every article page.
 *
 * Copy is the only interactive part, so it is the only reason this file is a
 * client component.
 */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const targets = [
    { label: 'واتس‌اپ', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    {
      label: 'تلگرام',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      label: 'لینکدین',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked (insecure origin, permission denied) — say so rather
      // than showing a success state that did not happen
      setCopied(false)
      window.prompt('نشانی را کپی کن:', url)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <span className="text-200 text-text-subtle">اشتراک‌گذاری</span>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-300 no-underline hover:underline"
        >
          {t.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="text-300 text-link underline underline-offset-4 hover:text-link-hover"
      >
        {copied ? 'کپی شد' : 'کپی لینک'}
      </button>
    </div>
  )
}
