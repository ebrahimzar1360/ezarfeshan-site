/**
 * End-to-end check of the newsletter double opt-in loop and the consult form,
 * against a running server and a real database.
 *
 *   node tools/audit/flow.mjs http://localhost:3210
 *
 * Tokens never appear in an API response — that is the point of hashing them —
 * so the confirm and unsubscribe links are recovered the way a real subscriber
 * gets them: from the message the mailer produced. With MAIL_DRIVER=console the
 * server prints it, so this reads the server log.
 */

import { readFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:3210'
const LOG = process.argv[3] ?? 'server.log'

let pass = 0
let fail = 0

function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

function tokenFromLog(pattern) {
  const log = readFileSync(LOG, 'utf8')
  const matches = [...log.matchAll(pattern)]
  return matches.length ? matches[matches.length - 1][1] : null
}

const email = `test-${Date.now()}@example.com`

console.log(`\nnewsletter — ${email}`)

// 1. signup
{
  const r = await post('/api/newsletter/subscribe', { email, source: 'test' })
  check('signup accepted', r.status === 200 && r.body?.ok === true, `status ${r.status}`)
}

// 2. validation
{
  const r = await post('/api/newsletter/subscribe', { email: 'not-an-email' })
  check('invalid address rejected', r.status === 422, `status ${r.status}`)
  check('field error is Persian', /[؀-ۿ]/.test(r.body?.error?.fields?.email ?? ''))
}

// 3. honeypot — accepted without subscribing, so the bot learns nothing
{
  const r = await post('/api/newsletter/subscribe', {
    email: `bot-${Date.now()}@example.com`,
    website: 'http://spam.example',
  })
  check('honeypot answers 200', r.status === 200 && r.body?.ok === true)
}

// 4. confirm
await new Promise((r) => setTimeout(r, 400))
const confirmToken = tokenFromLog(/newsletter\/confirm\?token=([A-Za-z0-9_-]+)/g)
check('confirm link was mailed', !!confirmToken)

if (confirmToken) {
  const res = await fetch(`${BASE}/api/newsletter/confirm?token=${confirmToken}`, { redirect: 'manual' })
  const location = res.headers.get('location') ?? ''
  check('confirm redirects to confirmed', location.includes('status=confirmed'), location)

  // replay: a mail scanner pre-fetching the link must not error
  const again = await fetch(`${BASE}/api/newsletter/confirm?token=${confirmToken}`, { redirect: 'manual' })
  const loc2 = again.headers.get('location') ?? ''
  check('replayed confirm is safe', loc2.includes('status=invalid') || loc2.includes('status=already'), loc2)
}

// 5. unsubscribe
await new Promise((r) => setTimeout(r, 400))
const unsubToken = tokenFromLog(/newsletter\/unsubscribe\?token=([A-Za-z0-9_-]+)/g)
check('unsubscribe link was mailed', !!unsubToken)

if (unsubToken) {
  const r = await post('/api/newsletter/unsubscribe', { token: unsubToken })
  check('unsubscribe works', r.status === 200 && r.body?.ok === true, `status ${r.status}`)

  const twice = await post('/api/newsletter/unsubscribe', { token: unsubToken })
  check('unsubscribing twice still says done', twice.status === 200)
}

// 6. bad token
{
  const r = await post('/api/newsletter/unsubscribe', { token: 'x'.repeat(40) })
  check('unknown token gives an actionable 404', r.status === 404 && /[؀-ۿ]/.test(r.body?.error?.message ?? ''))
}

console.log('\nconsult form')

{
  const r = await post('/api/leads', { name: 'ت', email: 'bad', challenge: 'کوتاه' })
  check('short enquiry rejected', r.status === 422)
  check('all three fields flagged', Object.keys(r.body?.error?.fields ?? {}).length >= 3)
}

{
  const r = await post('/api/leads', {
    name: 'آزمون خودکار',
    email: `lead-${Date.now()}@example.com`,
    challenge: 'تیم پنج نفره داریم و هر تصمیم غیرمعمول به من ارجاع می‌شود. دنبال راهی برای نوشتن فرایندها هستم.',
    teamSize: '2-5',
  })
  check('valid enquiry accepted', r.status === 200 && r.body?.ok === true, `status ${r.status}`)
}

console.log('\nhealth')
{
  const res = await fetch(`${BASE}/api/health`)
  const body = await res.json()
  check('health reports the database', res.status === 200 && body.db === 'up')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
