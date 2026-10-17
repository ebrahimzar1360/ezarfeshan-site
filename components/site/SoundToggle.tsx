'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { playPing, restoreSound, setSound, SOUND_EVENT, soundEnabled } from '@/lib/sound'

/**
 * The speaker button in the header: turns the 3D scenes' sound effects on or
 * off (lib/sound.ts). Off until the visitor asks; the choice is remembered.
 * A remembered "on" shows as on at once and unlocks on the first gesture.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(restoreSound())
    const sync = () => setOn(soundEnabled())
    window.addEventListener(SOUND_EVENT, sync)
    return () => window.removeEventListener(SOUND_EVENT, sync)
  }, [])

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on
        setSound(next)
        setOn(next)
        if (next) window.setTimeout(() => playPing(740), 60)
      }}
      aria-pressed={on}
      aria-label={on ? 'خاموش کردن صدای جلوه‌ها' : 'روشن کردن صدای جلوه‌ها'}
      title={on ? 'صدا: روشن' : 'صدا: خاموش'}
      className={`inline-flex size-10 items-center justify-center rounded-md border transition-colors duration-150 hover:border-accent hover:text-text ${
        on ? 'border-accent text-text' : 'border-border text-text-muted'
      }`}
    >
      <Icon name={on ? 'sound' : 'mute'} className="text-400" />
    </button>
  )
}
