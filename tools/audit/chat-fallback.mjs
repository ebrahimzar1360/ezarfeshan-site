/**
 * Verifies the 503 fallback: when the daily model quota is spent, the chat
 * widget must OPEN the lead form rather than tell the visitor to go find one.
 *
 *   node tools/audit/chat-fallback.mjs https://ezarfeshan-site.vercel.app
 *
 * /api/chat is intercepted and forced to the real 503 body, so this holds
 * whether or not the quota happens to be exhausted right now — the failure it
 * guards only occurs a few hours a day and would otherwise be untestable.
 */
import { chromium } from '@playwright/test'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const QUOTA_MESSAGE =
  'دستیار گفت‌وگو فعلاً در دسترس نیست (سقف روزانهٔ سرویس پر شده). ' +
  'همین‌جا فرم درخواست مشاوره را برایت باز کردم — پرش کن تا مستقیم به دست ابراهیم برسد. ' +
  'یا از صفحهٔ /contact مستقیم تماس بگیر.'

const failures = []
const check = (label, ok, detail) => {
  console.log(`  ${ok ? '✅' : '❌'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) failures.push(label)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.route('**/api/chat', (route) =>
  route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: { message: QUOTA_MESSAGE } }),
  })
)

console.log(`\nChat 503 fallback against ${base}\n${'═'.repeat(60)}`)
await page.goto(base, { waitUntil: 'domcontentloaded' })

// Open the widget.
await page.getByLabel('باز کردن گفت‌وگو با دستیار سایت').click({ timeout: 15_000 })

const input = page.getByLabel('ارسال پیام').locator('..').locator('textarea, input').first()
await input.waitFor({ timeout: 10_000 })

// A message that states a name and a phone, so the prefill is observable.
await input.fill('سلام، من سیاوش هستم، شمارهٔ من ۰۹۱۲۳۴۵۶۷۸۹ است. مشاوره می‌خواهم')
await input.press('Enter')

await page.waitForTimeout(2500)

const bodyText = await page.locator('body').innerText()
check('پیام صادقانهٔ سقف روزانه نمایش داده می‌شود', bodyText.includes('سقف روزانهٔ سرویس پر شده'))
check('بن‌بست نیست — راه ادامه دارد', /فرم|contact/.test(bodyText))

// The actual fix: the form must be open, not merely mentioned.
const nameField = page.getByLabel('نام', { exact: true })
const phoneField = page.getByLabel('تلفن', { exact: true })
const formOpen = await nameField.isVisible().catch(() => false)
check('فرم لید باز شده است', formOpen, 'فقط به فرم اشاره شده، باز نشده')

if (formOpen) {
  const name = await nameField.inputValue().catch(() => '')
  const phone = await phoneField.inputValue().catch(() => '')
  check('نام از گفت‌وگو پیش‌پر شده', name.includes('سیاوش'), `نام: «${name}»`)
  check('شماره از گفت‌وگو پیش‌پر شده', /9123456789/.test(phone), `شماره: «${phone}»`)
}

await page.screenshot({ path: 'shots/chat-503-fallback.png', fullPage: false })
console.log('\nℹ️  تصویر: shots/chat-503-fallback.png')

await browser.close()

if (failures.length) {
  console.log(`\n❌ ${failures.length} مورد ناموفق`)
  process.exit(1)
}
console.log('\n✅ همهٔ بررسی‌ها موفق')
