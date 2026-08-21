import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests for the two paths that must never break: newsletter signup all
 * the way through confirmation, and the admin writing an article that appears
 * on the public site.
 *
 * Uses the Chrome already installed on this machine (`channel: 'chrome'`)
 * rather than downloading Playwright's own Chromium — a 150 MB download on a
 * ~75 KB/s connection, for a browser that is already here.
 *
 * The server is NOT started by Playwright: it needs a built app and a running
 * database, so tools/audit/e2e.ps1 brings both up first and the config just
 * connects. Starting it here would hide a failed build behind a timeout.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // the tests share one database
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 30000,
  expect: { timeout: 8000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3210',
    locale: 'fa-IR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
})
