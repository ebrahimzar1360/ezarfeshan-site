import type { ChatTurn } from '@/lib/chat/history'

/** One source of truth: packHistory() consumes these, so the shape is defined
 * once beside it rather than restated here and left to drift. */
export type Message = ChatTurn

export type Lead = {
  name: string
  email: string
  phone: string
  challenge: string
  website: string
}
