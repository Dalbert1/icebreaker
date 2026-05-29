// Visual-verification harness for icebreaker.
//
// Walks the core flow at a phone viewport and writes screenshots to
// .screens/ so changes can be eyeballed between iterations. This is the
// Playwright loop referenced in CLAUDE.md / AGENTS.md.
//
//   node scripts/screenshot.mjs            # uses http://localhost:5173
//   BASE_URL=http://localhost:4173 node scripts/screenshot.mjs
//
// Requires the dev (or preview) server to already be running.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '.screens')
mkdirSync(OUT, { recursive: true })

const shot = async (page, name) => {
  await page.waitForTimeout(450) // let entrance animations settle
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  console.log(`  ✓ ${name}.png`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 12/13/14 logical size
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

try {
  console.log(`Capturing icebreaker @ ${BASE_URL}`)

  // Start fresh each run so the flow is deterministic. Navigate straight to a
  // real route (the bare base path without a trailing slash 404s on vite
  // preview; GitHub Pages redirects it, but we avoid it here).
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '01-discover')

  // Like the top card -> match modal.
  await page.getByRole('button', { name: 'Thaw' }).last().click()
  await shot(page, '02-match')

  // Break the ice -> category picker.
  await page.getByRole('button', { name: 'Break the ice' }).click()
  await shot(page, '03-game-category')

  // Pick a category -> first question.
  await page.getByRole('button', { name: /General Knowledge/ }).click()
  await shot(page, '04-game-question')

  // Answer the first question -> feedback state.
  await page.locator('main button').nth(1).click() // nth(0) is the Back button
  await page.waitForTimeout(350)
  await shot(page, '05-game-feedback')

  // Play through the rest of the round to reach results.
  for (let i = 0; i < 8; i++) {
    const advance = page.getByRole('button', { name: /Next question|See results/ })
    if (!(await advance.count())) break
    const last = /See results/.test((await advance.textContent()) ?? '')
    await advance.click()
    await page.waitForTimeout(300)
    if (last) break
    await page.locator('main button').nth(1).click() // answer next question
    await page.waitForTimeout(300)
  }
  await shot(page, '06-game-results')

  // Matches list (now shows a played round + advanced thaw).
  await page.goto(`${BASE_URL}/matches`, { waitUntil: 'networkidle' })
  await shot(page, '07-matches')

  // Profile.
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' })
  await shot(page, '08-profile')

  // Short-phone stress case (iPhone SE) — initial viewport must not overflow.
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '09-se-discover')

  // Desktop framing too.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '10-desktop')

  if (errors.length) {
    console.log(`\n⚠ ${errors.length} console error(s):`)
    for (const e of errors.slice(0, 10)) console.log(`   - ${e}`)
    process.exitCode = 1
  } else {
    console.log('\nNo console errors. Screenshots in .screens/')
  }
} catch (err) {
  console.error('Screenshot run failed:', err)
  process.exitCode = 1
} finally {
  await browser.close()
}
