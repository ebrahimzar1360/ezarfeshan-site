import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'

/**
 * One response shape for every route, so the client never has to guess.
 *
 *   { ok: true,  data }
 *   { ok: false, error: { message, fields? } }
 *
 * `message` is always a finished Persian sentence safe to show a reader.
 * Internal detail goes to the log, never into the body.
 */

export type ApiError = { message: string; fields?: Record<string, string> }

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true as const, data }, init)
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json(
    { ok: false as const, error: { message, ...(fields ? { fields } : {}) } },
    { status }
  )
}

export function failValidation(error: ZodError) {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fields[key]) fields[key] = issue.message
  }
  return fail('اطلاعات وارد‌شده کامل نیست.', 422, fields)
}

export function failRateLimit(retryAfterSeconds: number) {
  const minutes = Math.ceil(retryAfterSeconds / 60)
  return NextResponse.json(
    {
      ok: false as const,
      error: {
        message: `تعداد درخواست‌ها زیاد بود. ${minutes} دقیقهٔ دیگر دوباره تلاش کن.`,
      },
    },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  )
}

/** Logs the cause and returns a message a reader can act on. */
export function failUnexpected(context: string, cause: unknown) {
  console.error(`[api:${context}]`, cause)
  return fail('ارسال نشد — مشکلی در سرور پیش آمد. چند لحظه بعد دوباره تلاش کن.', 500)
}
