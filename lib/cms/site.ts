import { getSection } from './content'
import type { IconValue } from './registry'

/**
 * Typed accessors for the copy that more than one component reads.
 * The shapes match lib/site.ts, which now only holds the defaults' origin and
 * the non-editable values (URL, locale).
 */

export type Channel = {
  icon: IconValue
  label: string
  value: string
  href: string
  latin: boolean
  inFooter: boolean
}

export async function getIdentity() {
  return getSection('site.identity')
}

export async function getChannels(): Promise<Channel[]> {
  const { items } = await getSection('site.channels')
  return items as Channel[]
}

export async function getMainNav() {
  return getSection('nav.main')
}
