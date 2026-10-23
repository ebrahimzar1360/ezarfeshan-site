import { expect, test } from '@playwright/test'
import pg from 'pg'

/**
 * /services: four cards, one request dialog, real rows in `leads`.
 *
 * Each run sends its own X-Forwarded-For so the hourly limit (5 requests per
 * address) starts fresh — the suite submits four. The stored rows are read back
 * from the database the server writes to (DATABASE_URL, from the environment or
 * .env), because "the success message appeared" is not the same as "it saved".
 */

const ALERT = '[role="alert"]:not(#__next-route-announcer__)'

const SERVICES = [
  { button: 'درخواست عارضه‌یابی', title: 'عارضه‌یابی و نقشهٔ راه هوشمندسازی نمایندگی خودرو' },
  { button: 'درخواست معرفی تاما', title: 'تاما؛ مدیریت فرآیند پذیرش تا ترخیص خودرو' },
  { button: 'درخواست سیستم‌سازی', title: 'سیستم‌سازی و داشبورد مدیریت عملکرد' },
  { button: 'درخواست کارگاه', title: 'کارگاه کاربردی هوش مصنوعی برای مدیران' },
]

function databaseUrl(): string | undefined {
  if (!process.env.DATABASE_URL) {
    try {
      process.loadEnvFile()
    } catch {
      // no .env: the DB assertions are skipped below
    }
  }
  return process.env.DATABASE_URL?.replace(/\?schema=\w+$/, '')
}

test.describe('services', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 250)}-${Date.now()}` })
  })

  test('shows the four services in order, each with its own button', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('از تجربهٔ مدیریتی تا')
    const titles = await page.locator('main li h2').allInnerTexts()
    expect(titles).toEqual(SERVICES.map((s) => s.title))
    for (const s of SERVICES) await expect(page.getByRole('button', { name: s.button })).toBeVisible()
  })

  test('validates on the client and keeps what was typed when the server fails', async ({ page }) => {
    await page.goto('/services')
    await page.getByRole('button', { name: SERVICES[0]!.button }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'ثبت درخواست' }).click()
    await expect(dialog.getByText('نام و نام خانوادگی را وارد کن.')).toBeVisible()
    await expect(dialog.getByText('شمارهٔ موبایلت را وارد کن.')).toBeVisible()

    await dialog.getByLabel('شماره تماس').fill('02112345678')
    await dialog.getByRole('button', { name: 'ثبت درخواست' }).click()
    await expect(dialog.getByText('شمارهٔ موبایل معتبر نیست.', { exact: false })).toBeVisible()

    await page.route('**/api/leads', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false,"error":{"message":"ارسال نشد — مشکلی در سرور پیش آمد."}}' }))
    await dialog.getByLabel('نام و نام خانوادگی').fill('آزمون خطا')
    await dialog.getByLabel('شماره تماس').fill('09121112233')
    await dialog.getByLabel('ایمیل').fill('error@example.com')
    await dialog.getByLabel('مهم‌ترین مشکل یا نیاز مدیریتی').fill('یک متن آزمایشی برای خطای سرور.')
    await dialog.getByRole('button', { name: 'ثبت درخواست' }).click()
    await expect(dialog.locator(ALERT)).toContainText('ارسال نشد')
    await expect(dialog.getByLabel('نام و نام خانوادگی')).toHaveValue('آزمون خطا')
    await expect(dialog.getByLabel('ایمیل')).toHaveValue('error@example.com')
  })

  test('a link with ?service= opens that service’s form', async ({ page }) => {
    await page.goto('/services?service=tama')
    await expect(page.getByRole('dialog')).toContainText(SERVICES[1]!.title)
    await page.getByRole('dialog').getByRole('button', { name: 'بستن' }).first().click()
    await expect(page).toHaveURL(/\/services$/)
  })

  test('every service saves a real request', async ({ page }) => {
    const stamp = Date.now()
    await page.goto('/services')
    for (const [i, s] of SERVICES.entries()) {
      await page.getByRole('button', { name: s.button }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toContainText(s.title)
      await dialog.getByLabel('نام و نام خانوادگی').fill(`آزمون ${stamp} ${i}`)
      await dialog.getByLabel('نام نمایندگی یا کسب‌وکار').fill('نمایندگی آزمایشی')
      await dialog.getByLabel('شماره تماس').fill('۰۹۱۲ ۳۴۵ ۶۷۸۹')
      await dialog.getByLabel('ایمیل').fill(`e2e-${stamp}-${i}@example.com`)
      await dialog.getByLabel('مهم‌ترین مشکل یا نیاز مدیریتی').fill('گزارش‌های واحدها هر ماه دیر و ناقص می‌رسد.')
      await expect(dialog).toContainText('اطلاعات شما صرفاً برای بررسی درخواست')
      await dialog.getByRole('button', { name: 'ثبت درخواست' }).click()
      await expect(dialog.getByRole('status')).toContainText('درخواست شما با موفقیت ثبت شد.')
      await dialog.getByRole('button', { name: 'بستن' }).last().click()
      await expect(dialog).toBeHidden()
    }

    const url = databaseUrl()
    test.skip(!url, 'no DATABASE_URL to read the rows back from')
    const client = new pg.Client({ connectionString: url })
    await client.connect()
    try {
      const { rows } = await client.query(
        `SELECT name, phone, email, company, service, source, status FROM leads WHERE email LIKE $1 ORDER BY email`,
        [`e2e-${stamp}-%`],
      )
      expect(rows).toHaveLength(4)
      rows.forEach((r, i) => {
        expect(r).toMatchObject({
          phone: '09123456789',
          company: 'نمایندگی آزمایشی',
          service: SERVICES[i]!.title,
          source: 'services',
          status: 'NEW',
        })
      })
    } finally {
      await client.end()
    }
  })
})
