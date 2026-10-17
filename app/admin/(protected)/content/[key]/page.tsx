import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SectionEditor } from '@/components/admin/content/SectionEditor'
import { guard } from '@/lib/admin/guard'
import { getSection, getStoredSection } from '@/lib/cms/content'
import { GROUPS, SECTIONS, isSectionKey, type GroupKey } from '@/lib/cms/registry'

export const dynamic = 'force-dynamic'

const VIEW: Record<GroupKey, string> = {
  global: '/',
  header: '/',
  footer: '/',
  home: '/',
  about: '/about',
  projects: '/projects',
  contact: '/contact',
  articles: '/articles',
  misc: '/articles',
}

export default async function ContentSectionPage({ params }: { params: Promise<{ key: string }> }) {
  await guard('content.edit')
  const { key: raw } = await params
  const key = decodeURIComponent(raw)
  if (!isSectionKey(key)) notFound()

  const def = SECTIONS[key]
  const [values, stored] = await Promise.all([getSection(key), getStoredSection(key)])

  return (
    <>
      <nav aria-label="مسیر" className="mb-4 text-200 text-text-subtle">
        <Link href="/admin/content">متن‌ها و دکمه‌ها</Link> <span aria-hidden>/</span> {GROUPS[def.group].label}
      </nav>
      <h1 className="gold-marker mb-3 text-700">{def.label}</h1>
      {'description' in def && def.description && (
        <p className="mb-8 max-w-3xl text-300 leading-prose text-text-muted">{def.description}</p>
      )}
      <SectionEditor
        sectionKey={key}
        fields={def.fields}
        initial={values as Record<string, unknown>}
        defaults={def.defaults as Record<string, unknown>}
        edited={stored !== undefined}
        viewHref={VIEW[def.group]}
      />
    </>
  )
}
