/**
 * Layout auditor. Drives headless Chrome over the DevTools Protocol to measure a
 * page at several widths and report anything that overflows the viewport.
 *
 *   node tools/audit/measure.js http://localhost:3210/ 360 390 768 1440 1920
 *
 * Catches the class of bug a screenshot only hints at: which element is wider
 * than the page, and by how much.
 */

const { spawn } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const CHROME =
  process.env.CHROME_PATH ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe',
   'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))

const url = process.argv[2] || 'http://localhost:3000/'
const widths = process.argv.slice(3).map(Number)
const WIDTHS = widths.length ? widths : [360, 390, 768, 1440, 1920]
const PORT = 9223 + (process.pid % 200)

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    let id = 0
    const pending = new Map()
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const msgId = ++id
          ws.send(JSON.stringify({ id: msgId, method, params }))
          return new Promise((res, rej) => pending.set(msgId, { res, rej }))
        },
        close: () => ws.close(),
      })
    )
    ws.addEventListener('error', reject)
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data)
      const p = pending.get(msg.id)
      if (!p) return
      pending.delete(msg.id)
      msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result)
    })
  })
}

const PROBE = `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    // in RTL, overflow shows up as a negative left edge or a right edge past vw
    const overRight = Math.round(r.right - vw);
    const overLeft = Math.round(-r.left);
    const over = Math.max(overRight, overLeft);
    if (over > 1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 90),
        over,
        w: Math.round(r.width),
      });
    }
  }
  offenders.sort((a, b) => b.over - a.over);
  return JSON.stringify({
    viewport: vw,
    scrollWidth: de.scrollWidth,
    overflow: de.scrollWidth - vw,
    offenders: offenders.slice(0, 8),
  });
})()`

;(async () => {
  if (!CHROME) throw new Error('no Chrome/Edge found; set CHROME_PATH')
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-'))
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--disable-gpu',
    'about:blank',
  ])
  chrome.on('error', (e) => { throw e })

  // wait for the debugging endpoint
  let wsUrl = null
  for (let i = 0; i < 60 && !wsUrl; i++) {
    await new Promise((r) => setTimeout(r, 250))
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      wsUrl = (await res.json()).webSocketDebuggerUrl
    } catch {}
  }
  if (!wsUrl) { chrome.kill(); throw new Error('Chrome did not expose a debug port') }

  const browser = await connect(wsUrl)
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const page = await connect(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`)
  await page.send('Page.enable')
  await page.send('Runtime.enable')

  let failures = 0
  for (const width of WIDTHS) {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width, height: 900, deviceScaleFactor: 1, mobile: width < 768,
    })
    await page.send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 1400))
    const { result } = await page.send('Runtime.evaluate', {
      expression: PROBE, returnByValue: true,
    })
    const data = JSON.parse(result.value)
    const ok = data.overflow <= 1
    if (!ok) failures++
    console.log(
      `${String(width).padStart(5)}px  scrollWidth=${String(data.scrollWidth).padEnd(6)} ` +
        `overflow=${String(data.overflow).padEnd(5)} ${ok ? 'OK' : 'OVERFLOW'}`
    )
    for (const o of data.offenders) {
      console.log(`         +${String(o.over).padEnd(5)} w=${String(o.w).padEnd(5)} <${o.tag}> ${o.cls}`)
    }
  }

  page.close(); browser.close(); chrome.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error(e.message); process.exit(2) })
