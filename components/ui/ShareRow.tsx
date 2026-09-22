'use client'

import { useState } from 'react'
import { useToast } from './Toast'

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
  const toast = useToast()

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
      // Clipboard blocked: insecure origin, or the permission was denied. Never
      // show the success state for something that did not happen.
      //
      // This used to open a window.prompt with the URL preselected, which is a
      // modal system dialog interrupting an article to apologise. A toast says
      // the same thing without stealing focus, and the address is already in
      // the browser's own bar.
      setCopied(false)
      toast.problem('کپی نشد — مرورگر اجازه نداد. نشانی را از نوار آدرس بردار.')
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
      {/* The inline label stays the primary confirmation — it is beside the
          control the reader just pressed, which beats a corner popup. The toast
          is only for the failure path, which has no inline home. */}
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
