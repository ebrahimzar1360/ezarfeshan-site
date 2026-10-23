import Link from 'next/link'
import { guard } from '@/lib/admin/guard'
import { LeadRow } from '@/components/admin/LeadRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { LEAD_SOURCES, getLeadCounts, getLeads, type LeadSource } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

const SOURCE_LABELS: Record<LeadSource, string> = {
  services: 'خدمات',
  consult: 'مشاوره',
  contact: 'تماس',
}

/**
 * One inbox for every form: service requests (/services), consultation
 * requests (/consult and the chat widget) and contact messages. Newest first;
 * the tabs narrow it to one form. Access: `leads.view` (guard here, and
 * requirePermission in updateLead).
 */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  await guard('leads.view')
  const { source: raw } = await searchParams
  const source = LEAD_SOURCES.includes(raw as LeadSource) ? (raw as LeadSource) : undefined
  const [leads, counts] = await Promise.all([getLeads(source), getLeadCounts()])

  const tabs = [
    { key: undefined, label: 'همه', ...counts.total },
    ...LEAD_SOURCES.map((s) => ({ key: s, label: SOURCE_LABELS[s], ...(counts.bySource[s] ?? { all: 0, new: 0 }) })),
  ]

  return (
    <>
      <h1 className="gold-marker mb-6 text-700">درخواست‌ها و پیام‌ها</h1>

      <nav aria-label="منبع درخواست" className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === source
          return (
            <Link
              key={t.label}
              href={t.key ? `/admin/leads?source=${t.key}` : '/admin/leads'}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-200 no-underline ${
                active ? 'border-forest bg-forest text-paper' : 'border-border bg-bg-raised text-text hover:border-border-strong'
              }`}
            >
              {t.label}
              <span className={active ? 'text-paper/80' : 'text-text-subtle'}>{t.all.toLocaleString('fa-IR')}</span>
              {t.new > 0 && (
                <span className={`rounded-sm px-1.5 text-[0.7rem] font-bold ${active ? 'bg-paper/20' : 'bg-gold/30 text-text'}`}>
                  {t.new.toLocaleString('fa-IR')} جدید
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {leads.length === 0 ? (
        <EmptyState
          title="هنوز درخواستی نرسیده"
          body="وقتی کسی یکی از فرم‌های خدمات، مشاوره یا تماس را پر کند، اینجا می‌آید."
          action={{ label: 'دیدن صفحهٔ خدمات', href: '/services' }}
        />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={{
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                teamSize: lead.teamSize,
                budgetRange: lead.budgetRange,
                challenge: lead.challenge,
                service: lead.service,
                source: (lead.source as LeadSource | null) ?? 'consult',
                status: lead.status,
                note: lead.note,
                createdAt: lead.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
