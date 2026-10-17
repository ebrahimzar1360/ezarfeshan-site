/**
 * Renders tools/render/scenes.js to WebP in public/renders/.
 *
 *   node tools/render/render.mjs              # every scene
 *   node tools/render/render.mjs cover-ai-0   # just these
 *
 * Serves the repo on a local port so the page can import three from
 * node_modules, drives a headless Chromium (--headless=new, see CLAUDE.md),
 * renders each scene at twice its size and downsamples with sharp. Set
 * CHROME_PATH to use a specific browser.
 */
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import sharp from 'sharp'
import { chromium } from 'playwright'

const ROOT = process.cwd()
const OUT = join(ROOT, 'public', 'renders')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' }

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '')
  if (!path.startsWith('tools') && !path.startsWith('node_modules')) return res.writeHead(404).end()
  try {
    const body = await readFile(join(ROOT, path))
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const port = server.address().port

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.error('pageerror', e.message))
await page.goto(`http://127.0.0.1:${port}/tools/render/index.html`)
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 })

const all = await page.evaluate(() => window.SCENE_NAMES)
const wanted = process.argv.slice(2)
const names = wanted.length ? all.filter((n) => wanted.includes(n)) : all
await mkdir(OUT, { recursive: true })

for (const name of names) {
  const t = Date.now()
  const url = await page.evaluate((n) => window.renderScene(n), name)
  const png = Buffer.from(url.split(',')[1], 'base64')
  const meta = await sharp(png).metadata()
  await sharp(png)
    .resize(Math.round(meta.width / 2), Math.round(meta.height / 2), { kernel: 'lanczos3' })
    .webp({ quality: 84, effort: 6 })
    .toFile(join(OUT, `${name}.webp`))
  console.log(`${name}  ${Date.now() - t}ms`)
}

await browser.close()
server.close()
