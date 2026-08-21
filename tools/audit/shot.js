/**
 * Full-page screenshots over the DevTools Protocol.
 *
 *   node tools/audit/shot.js <url> <outDir> [width...]        # light theme
 *   THEME=dark node tools/audit/shot.js <url> <outDir> 390
 *
 * Uses --headless=new with Emulation.setDeviceMetricsOverride. Chrome's legacy
 * --headless --screenshot --window-size path mis-renders RTL pages: it reports a
 * clipped, horizontally shifted frame even when the layout is correct.
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
const outDir = process.argv[3] || '.'
const widths = process.argv.slice(4).map(Number)
const WIDTHS = widths.length ? widths : [390, 1440]
const THEME = process.env.THEME || 'light'
const PORT = 9400 + (process.pid % 200)

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

;(async () => {
  if (!CHROME) throw new Error('no Chrome/Edge found; set CHROME_PATH')
  fs.mkdirSync(outDir, { recursive: true })
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shot-'))
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ])
  chrome.on('error', (e) => { throw e })

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

  // set the theme the same way a visitor would: persist the choice, then load
  if (THEME === 'dark' || THEME === 'light') {
    await page.send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 900))
    await page.send('Runtime.evaluate', {
      expression: `try{localStorage.setItem('theme','${THEME}')}catch(e){}`,
    })
  }

  for (const width of WIDTHS) {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width, height: 900, deviceScaleFactor: 2, mobile: width < 768,
    })
    await page.send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 1400))

    // captureBeyondViewport paints the full page without ever scrolling it, so
    // loading="lazy" images below the fold stay unloaded and shoot as blank
    // boxes. Walk the page to trigger them, then return to the top and let the
    // decodes finish before capturing.
    await page.send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images]
          .filter(i => !i.complete)
          .map(i => new Promise(r => { i.onload = i.onerror = r })));
      })()`,
    })
    await new Promise((r) => setTimeout(r, 700))

    const { data } = await page.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      optimizeForSpeed: false,
    })
    const file = path.join(outDir, `${THEME}-${width}.png`)
    fs.writeFileSync(file, Buffer.from(data, 'base64'))
    console.log(`${file}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`)
  }

  page.close(); browser.close(); chrome.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}
})().catch((e) => { console.error(e.message); process.exit(1) })
