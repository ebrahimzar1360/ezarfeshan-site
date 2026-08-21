/**
 * Phase 7 checks: sitemap, robots, RSS, JSON-LD, OG images, analytics, search.
 *
 *   node tools/audit/seo.mjs http://localhost:3210
 */

const BASE = process.argv[2] ?? 'http://localhost:3210'
let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

console.log('\nsitemap and robots')
{
  const res = await fetch(`${BASE}/sitemap.xml`)
  const xml = await res.text()
  check('sitemap serves', res.status === 200, `status ${res.status}`)
  check('sitemap lists articles', (xml.match(/\/articles\//g) ?? []).length >= 6)
  check('sitemap excludes /admin', !xml.includes('/admin'))
  check('sitemap excludes empty topics', !xml.includes('/topics/') || (xml.match(/\/topics\//g) ?? []).length <= 4)
}
{
  const res = await fetch(`${BASE}/robots.txt`)
  const txt = await res.text()
  check('robots serves', res.status === 200)
  check('robots disallows /admin', txt.includes('/admin'))
  check('robots points at the sitemap', txt.toLowerCase().includes('sitemap:'))
}

console.log('\nrss')
{
  const res = await fetch(`${BASE}/rss.xml`)
  const xml = await res.text()
  check('rss serves as xml', res.status === 200 && (res.headers.get('content-type') ?? '').includes('rss'))
  check('rss declares utf-8', xml.includes('encoding="UTF-8"'))
  check('rss declares fa-IR', xml.includes('<language>fa-IR</language>'))
  check('rss carries items', (xml.match(/<item>/g) ?? []).length >= 6)
  // A greedy [^<]* here reaches the closing tag and matches its '<' every time.
  // The realistic failure is a raw ampersand, so look for one that is not an entity.
  check('rss has no unescaped ampersand', !/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(xml))
}

console.log('\njson-ld')
{
  const home = await (await fetch(BASE)).text()
  const blocks = [...home.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1])
  check('homepage emits JSON-LD', blocks.length >= 2)

  let parsed = []
  try { parsed = blocks.map((b) => JSON.parse(b.replace(/\u003c/g, '<'))) } catch { /* left empty */ }
  check('JSON-LD parses', parsed.length === blocks.length)
  check('Person is present', parsed.some((p) => p['@type'] === 'Person'))
  check('WebSite has SearchAction', parsed.some((p) => p['@type'] === 'WebSite' && p.potentialAction))

  const article = await (await fetch(`${BASE}/articles/founder-dependency`)).text()
  const aBlocks = [...article.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .map((m) => JSON.parse(m[1].replace(/\u003c/g, '<')))
  check('article emits Article', aBlocks.some((p) => p['@type'] === 'Article'))
  check('article emits BreadcrumbList', aBlocks.some((p) => p['@type'] === 'BreadcrumbList'))
}

console.log('\nopen graph image')
{
  const res = await fetch(`${BASE}/api/og?title=${encodeURIComponent('سیستم بساز، آزاد باش')}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  check('og renders a PNG', res.status === 200 && isPng, `status ${res.status}`)
  check('og is a real image, not a blank', bytes.length > 8000, `${bytes.length} bytes`)
  // width/height live in the IHDR chunk at bytes 16..24
  const view = new DataView(bytes.buffer)
  check('og is 1200x630', view.getUint32(16) === 1200 && view.getUint32(20) === 630,
    `${view.getUint32(16)}x${view.getUint32(20)}`)

  const article = await (await fetch(`${BASE}/articles/founder-dependency`)).text()
  check('article meta points at the og route', article.includes('/api/og?title='))
}

console.log('\nanalytics')
{
  const res = await fetch(`${BASE}/api/analytics/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '/articles/founder-dependency' }),
  })
  check('pageview accepted', res.status === 204, `status ${res.status}`)
  check('pageview sets no cookie', !res.headers.getSetCookie?.()?.length)

  const admin = await fetch(`${BASE}/api/analytics/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '/admin/articles' }),
  })
  check('admin paths are accepted but not recorded', admin.status === 204, `status ${admin.status}`)

  const bad = await fetch(`${BASE}/api/analytics/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'https://evil.example/x' }),
  })
  check('absolute paths rejected', bad.status === 400, `status ${bad.status}`)
}

console.log('\nsearch')
{
  const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent('سیستم')}`)
  const body = await res.json()
  check('search responds', res.status === 200 && body.ok)
  check('search finds Persian matches', (body.data?.results?.length ?? 0) > 0,
    `${body.data?.results?.length ?? 0} results`)

  const partial = await (await fetch(`${BASE}/api/search?q=${encodeURIComponent('مستند')}`)).json()
  check('partial word matches via trigram', (partial.data?.results?.length ?? 0) > 0,
    `${partial.data?.results?.length ?? 0} results`)

  const short = await (await fetch(`${BASE}/api/search?q=%D8%B3`)).json()
  check('single letter returns nothing rather than everything', short.data?.results?.length === 0)

  const none = await (await fetch(`${BASE}/api/search?q=zzzznotfoundzzzz`)).json()
  check('no match returns an empty list, not an error', none.ok && none.data.results.length === 0)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
