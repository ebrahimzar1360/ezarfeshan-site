/**
 * Verifies the reading rail actually fills with scroll rather than sitting at
 * its end state. A full-page screenshot cannot show this: it renders scroll-driven
 * animations at whatever position the capture leaves them.
 *
 *   node tools/audit/rail.js <article-url>
 */

const { spawn } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const CHROME =
  process.env.CHROME_PATH ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe',
   'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))

const url = process.argv[2]
if (!url) { console.error('usage: node tools/audit/rail.js <url>'); process.exit(2) }
const PORT = 9600 + (process.pid % 200)

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    let id = 0
    const pending = new Map()
    ws.addEventListener('open', () => resolve({
      send(method, params = {}) {
        const msgId = ++id
        ws.send(JSON.stringify({ id: msgId, method, params }))
        return new Promise((res, rej) => pending.set(msgId, { res, rej }))
      },
      close: () => ws.close(),
    }))
    ws.addEventListener('error', reject)
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      const p = pending.get(m.id)
      if (!p) return
      pending.delete(m.id)
      m.error ? p.rej(new Error(m.error.message)) : p.res(m.result)
    })
  })
}

// scaleY lives in the matrix's `d` component: matrix(a, b, c, d, e, f)
const PROBE = `(() => {
  const rail = document.querySelector('.reading-rail');
  if (!rail) return JSON.stringify({ error: 'no .reading-rail on the page' });
  const t = getComputedStyle(rail, '::after').transform;
  const m = t && t !== 'none' ? t.match(/matrix\\(([^)]+)\\)/) : null;
  const scaleY = m ? parseFloat(m[1].split(',')[3]) : (t === 'none' ? 1 : null);
  return JSON.stringify({
    scrollY: Math.round(window.scrollY),
    max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
    scaleY: scaleY === null ? null : Number(scaleY.toFixed(3)),
    raw: t,
  });
})()`

;(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rail-'))
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', 'about:blank'])

  let wsUrl = null
  for (let i = 0; i < 60 && !wsUrl; i++) {
    await new Promise((r) => setTimeout(r, 250))
    try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl } catch {}
  }
  const browser = await connect(wsUrl)
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const page = await connect(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`)
  await page.send('Page.enable'); await page.send('Runtime.enable')
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
  await page.send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, 1800))

  const samples = []
  for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
    await page.send('Runtime.evaluate', {
      expression: `window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * ${frac})`,
    })
    await new Promise((r) => setTimeout(r, 500))
    const { result } = await page.send('Runtime.evaluate', { expression: PROBE, returnByValue: true })
    const d = JSON.parse(result.value)
    if (d.error) { console.error(d.error); process.exit(1) }
    samples.push(d)
    console.log(`scroll ${String(Math.round(frac * 100)).padStart(3)}%  y=${String(d.scrollY).padStart(5)}  scaleY=${d.scaleY}`)
  }

  const first = samples[0].scaleY
  const last = samples[samples.length - 1].scaleY
  const monotonic = samples.every((s, i) => i === 0 || s.scaleY >= samples[i - 1].scaleY - 0.001)
  console.log('')
  if (last > first + 0.2 && monotonic) console.log(`PASS — rail fills ${first} -> ${last} as the page scrolls`)
  else if (first === last) console.log(`FAIL — scaleY is stuck at ${first}; the animation is not driving`)
  else console.log(`WARN — moves ${first} -> ${last} but not monotonically`)

  page.close(); browser.close(); chrome.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
})().catch((e) => { console.error(e.message); process.exit(2) })
