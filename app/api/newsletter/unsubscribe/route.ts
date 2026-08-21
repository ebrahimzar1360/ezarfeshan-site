import type { NextRequest } from 'next/server'
import { fail, failUnexpected, failValidation, ok } from '@/lib/api/respond'
import { db } from '@/lib/db'
import { hashToken } from '@/lib/tokens'
import { unsubscribeSchema } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Unsubscribe.
 *
 * POST rather than GET: mail clients and security scanners pre-fetch links, and
 * a GET here would unsubscribe people who never clicked. The emailed link opens
 * a page with a single confirm button that posts here.
 *
 * The token is not cleared, so the same link keeps working — someone who
 * unsubscribes twice should see "done", not "invalid link".
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = unsubscribeSchema.safeParse(await request.json())
    if (!parsed.success) return failValidation(parsed.error)

    const subscriber = await db.subscriber.findUnique({
      where: { unsubscribeTokenHash: hashToken(parsed.data.token) },
    })

    if (!subscriber) {
      return fail('این لینک معتبر نیست یا منقضی شده. اگر همچنان ایمیل دریافت می‌کنی، به ما بنویس.', 404)
    }

    if (subscriber.status !== 'UNSUBSCRIBED') {
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
      })
    }

    return ok({ unsubscribed: true, email: subscriber.email })
  } catch (cause) {
    return failUnexpected('newsletter/unsubscribe', cause)
  }
}
