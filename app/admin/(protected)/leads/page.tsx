import { LeadRow } from '@/components/admin/LeadRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { getLeads } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <>
      <h1 className="gold-marker mb-8 text-700">درخواست‌های مشاوره</h1>
      {leads.length === 0 ? (
        <EmptyState
          title="هنوز درخواستی نرسیده"
          body="وقتی کسی فرم مشاوره را پر کند، اینجا می‌آید و یک ایمیل هم برایت فرستاده می‌شود."
          action={{ label: 'دیدن فرم', href: '/consult' }}
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
