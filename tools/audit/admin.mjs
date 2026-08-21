/**
 * Proves the admin area is actually closed.
 *
 *   node tools/audit/admin.mjs http://localhost:3210 email password
 *
 * A login form that looks right proves nothing. What matters is that every
 * admin route and every data endpoint refuses an anonymous caller, and that a
 * wrong password is refused in a way that leaks nothing about which addresses
 * exist.
 */

const BASE = process.argv[2] ?? 'http://localhost:3210'
const EMAIL = process.argv[3]
const PASSWORD = process.argv[4]

let pass = 0
let fail = 0

function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

const ADMIN_PAGES = ['/admin', '/admin/articles', '/admin/articles/new', '/admin/topics',
  '/admin/subscribers', '/admin/leads']

console.log('\nanonymous access')

for (const path of ADMIN_PAGES) {
  const res = await fetch(BASE + path, { redirect: 'manual' })
  const location = res.headers.get('location') ?? ''
  const blocked = res.status === 307 || res.status === 302
  check(`${path} redirects to login`, blocked && location.includes('/admin/login'),
    `status ${res.status} -> ${location || '(no redirect)'}`)
}

{
  const res = await fetch(`${BASE}/api/admin/subscribers-csv`, { redirect: 'manual' })
  // must not hand over the list, by any status
  const body = res.status === 200 ? await res.text() : ''
  check('subscriber CSV refuses anonymous', res.status !== 200 || !body.includes('@'),
    `status ${res.status}`)
}

{
  const res = await fetch(`${BASE}/admin/login`)
  check('login page is reachable', res.status === 200, `status ${res.status}`)
}

// The successful login runs FIRST. Login is rate limited to 8 attempts per
// address per 15 minutes, and the timing probes below burn a dozen — running
// them first made the real login fail, which looked like a broken login and was
// actually the limiter doing its job.
console.log('\ncredentials')

async function attemptLogin(email, password) {
  // Auth.js requires a CSRF token round trip before credentials are accepted
  const jar = new Map()
  const keep = (res) => {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';')
      const idx = pair.indexOf('=')
      jar.set(pair.slice(0, idx), pair.slice(idx + 1))
    }
  }
  const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')

  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  keep(csrfRes)
  const { csrfToken } = await csrfRes.json()

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: cookie() },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: `${BASE}/admin` }),
  })
  keep(res)
  return { status: res.status, location: res.headers.get('location') ?? '', cookie: cookie(), jar }
}

// Warm up before anything is timed or counted. The first attempt pays for
// loading the native Argon2 binding, which dwarfs the difference measured below
// and once made this report a 7x timing gap that was not real.
await attemptLogin('warmup@example.com', 'warmup-password')

if (EMAIL && PASSWORD) {
  const good = await attemptLogin(EMAIL, PASSWORD)
  const sessionCookie = good.cookie
  const hasSession = [...good.jar.keys()].some((k) => k.includes('session-token'))
  check('correct password issues a session', hasSession)

  if (hasSession) {
    console.log('\nauthenticated access')
    for (const path of ADMIN_PAGES) {
      const res = await fetch(BASE + path, { headers: { cookie: sessionCookie }, redirect: 'manual' })
      check(`${path} opens`, res.status === 200, `status ${res.status}`)
    }

    const csv = await fetch(`${BASE}/api/admin/subscribers-csv`, {
      headers: { cookie: sessionCookie },
    })
    // Check the raw bytes: fetch().text() decodes UTF-8 and swallows the BOM,
    // so a string comparison cannot tell whether it was actually sent — and the
    // BOM is the whole reason Excel opens Persian names correctly.
    const bytes = new Uint8Array(await csv.arrayBuffer())
    const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
    check('CSV downloads', csv.status === 200, `status ${csv.status}`)
    check('CSV starts with a UTF-8 BOM for Excel', hasBom,
      `first bytes ${[...bytes.slice(0, 3)].map((b) => b.toString(16)).join(' ')}`)
    check('CSV declares utf-8', (csv.headers.get('content-type') ?? '').includes('utf-8'))
    check('CSV is not cached', (csv.headers.get('cache-control') ?? '').includes('no-store'))
  }
} else {
  console.log('\n(no credentials passed — skipping the authenticated half)')
}

console.log('\nrejected credentials')

{
  const wrongUser = await attemptLogin('nobody-here@example.com', 'whatever-password')
  check('unknown address gets no session',
    ![...wrongUser.jar.keys()].some((k) => k.includes('session-token')))

  if (EMAIL) {
    const wrongPass = await attemptLogin(EMAIL, 'definitely-the-wrong-password')
    check('wrong password gets no session',
      ![...wrongPass.jar.keys()].some((k) => k.includes('session-token')))

    // Median of several samples — one timing on a loaded dev machine is noise.
    const median = async (email, password) => {
      const runs = []
      for (let i = 0; i < 5; i++) {
        const t = Date.now()
        await attemptLogin(email, password)
        runs.push(Date.now() - t)
      }
      return runs.sort((a, b) => a - b)[2]
    }

    const tUnknown = await median('nobody-here@example.com', 'whatever-password')
    const tWrong = await median(EMAIL, 'definitely-the-wrong-password')
    const ratio = Math.max(tUnknown, tWrong) / Math.max(1, Math.min(tUnknown, tWrong))
    check(`timing does not leak account existence (${tUnknown}ms vs ${tWrong}ms)`, ratio < 2,
      `ratio ${ratio.toFixed(1)}x`)
  }
}

if (EMAIL && PASSWORD) {
  console.log('\nrate limiting')

  // Burn attempts deliberately rather than assuming the probes above spent
  // enough. The limit is 8 per address per 15 minutes and the earlier checks
  // land close to it, so an off-by-one made this look broken when it was not.
  for (let i = 0; i < 10; i++) {
    await attemptLogin(EMAIL, `wrong-on-purpose-${i}`)
  }

  // Once the budget is gone even the correct password must be refused.
  const locked = await attemptLogin(EMAIL, PASSWORD)
  const stillIn = [...locked.jar.keys()].some((k) => k.includes('session-token'))
  check('a burst of failures locks the address out', !stillIn,
    'correct password still accepted after the attempt budget was spent')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
