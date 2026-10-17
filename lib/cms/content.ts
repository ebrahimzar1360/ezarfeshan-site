import { cache } from 'react'
import { db } from '@/lib/db'
import { mergeWithDefaults } from './normalize'
import { SECTIONS, type SectionKey, type SectionValues } from './registry'

/**
 * Read path for editable site copy.
 *
 * Stored in the existing `settings` table, one row per section, under the key
 * `content:<section>`. All sections are read in one query per request (React
 * `cache`), since a page asks for several and the header and footer ask too.
 *
 * Public pages are ISR; saving in the admin calls revalidatePath('/', 'layout')
 * so the change shows on the next request instead of after the hour.
 *
 * If the database cannot be reached the defaults are served — the site keeps
 * its shipped copy rather than failing every page because one table is missing.
 */

export const CONTENT_PREFIX = 'content:'

const loadAll = cache(async (): Promise<Map<string, unknown>> => {
  try {
    const rows = await db.setting.findMany({ where: { key: { startsWith: CONTENT_PREFIX } } })
    return new Map(rows.map((r) => [r.key.slice(CONTENT_PREFIX.length), r.value]))
  } catch (cause) {
    console.error('[cms] content unavailable, serving defaults', cause)
    return new Map()
  }
})

export async function getSection<K extends SectionKey>(key: K): Promise<SectionValues<K>> {
  const stored = (await loadAll()).get(key)
  const def = SECTIONS[key]
  return mergeWithDefaults(def.fields, stored, def.defaults as Record<string, unknown>) as SectionValues<K>
}

/** Raw stored value (or undefined) — the admin uses it to show "edited" vs "default". */
export async function getStoredSection(key: SectionKey): Promise<unknown> {
  return (await loadAll()).get(key)
}
