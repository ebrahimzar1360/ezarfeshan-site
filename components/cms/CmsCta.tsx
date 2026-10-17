import { CtaBand } from '@/components/site/CtaBand'
import { getSection } from '@/lib/cms/content'
import { Inline } from './Inline'

type CtaKey = 'home.cta' | 'about.cta' | 'projects.cta'

/** The closing invitation, from a CMS section. An empty primary label hides the band. */
export async function CmsCta({ section }: { section: CtaKey }) {
  const s = await getSection(section)
  if (!s.title) return null
  const primary = s.primary.label && s.primary.href ? s.primary : null
  const secondary = s.secondary.label && s.secondary.href ? s.secondary : undefined
  if (!primary) return null
  return (
    <CtaBand
      title={<Inline text={s.title} accentClass="text-gold-light" />}
      text={s.text ? <Inline text={s.text} accentClass="text-gold-light" /> : undefined}
      primary={primary}
      secondary={secondary}
    />
  )
}
