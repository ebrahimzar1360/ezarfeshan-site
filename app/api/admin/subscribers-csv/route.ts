import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * CSV of confirmed subscribers only.
 *
 * Pending addresses are excluded: someone who never clicked the confirmation
 * link has not opted in, and exporting them into a mailing tool is how a list
 * gets a spam complaint.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const rows = await db.subscriber.findMany({
    where: { status: 'CONFIRMED' },
    orderBy: { confirmedAt: 'asc' },
    select: { email: true, name: true, source: true, confirmedAt: true },
  })

  const csv = [
    'email,name,source,confirmed_at',
    ...rows.map((r) =>
      [r.email, r.name ?? '', r.source ?? '', r.confirmedAt?.toISOString() ?? '']
        .map(csvCell)
        .join(',')
    ),
  ].join('\r\n')

  const date = new Date().toISOString().slice(0, 10)

  return new Response(
    // BOM so Excel opens UTF-8 correctly instead of mangling Persian names
    '\uFEFF' + csv,
    {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    }
  )
}

/**
 * Quotes the cell and neutralises formula injection: a value starting with
 * = + - or @ is executed by Excel when the file is opened.
 */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}
