import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Node, not jsdom: everything under test here is pure logic — schemas,
    // tokens, formatting, date maths. Components are covered by the browser
    // tests in e2e/, where they run against a real server and database.
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    testTimeout: 10000,
  },
})
