import { getSection } from '@/lib/cms/content'

/**
 * The services on /services and the homepage preview, from the CMS section
 * `services.items` (defaults in lib/cms/registry.ts). Hidden ones are dropped
 * and the one-per-line outputs become a list.
 *
 * The same list is the server's allowlist: /api/leads accepts a service
 * request only for a slug found here, and stores that service's title.
 */
export type Service = {
  readonly slug: string
  readonly title: string
  readonly kind: string
  readonly audience: string
  readonly problem: string
  readonly outputsLabel: string
  readonly outputs: readonly string[]
  readonly duration: string
  readonly price: string
  readonly button: string
}

export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function getServices(): Promise<Service[]> {
  const { items } = await getSection('services.items')
  return items
    .filter((s) => !s.hidden && s.slug && s.title)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      kind: s.kind,
      audience: s.audience,
      problem: s.problem,
      outputsLabel: s.outputsLabel,
      outputs: splitLines(s.outputs),
      duration: s.duration,
      price: s.price,
      button: s.button,
    }))
}

export async function findService(slug: string): Promise<Service | null> {
  return (await getServices()).find((s) => s.slug === slug) ?? null
}
