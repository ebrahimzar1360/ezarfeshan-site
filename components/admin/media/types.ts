/** Mirror of lib/media/store.ts MediaSummary, for client components. */
export type MediaItem = {
  id: string
  url: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alt: string
  caption: string | null
  createdAt: string
}

export function formatBytes(n: number): string {
  const fmt = (v: number) => v.toLocaleString('fa-IR', { maximumFractionDigits: 1 })
  if (n < 1024) return `${fmt(n)} بایت`
  if (n < 1024 * 1024) return `${fmt(n / 1024)} کیلوبایت`
  return `${fmt(n / 1024 / 1024)} مگابایت`
}
