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

  // Start fresh each run so the flow is deterministic.
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())

  // Onboarding — shown on first launch before any preference is set.
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '01-onboarding')

  // Pick "Everyone" so the full discover pool is visible.
  await page.getByRole('button', { name: /Everyone/ }).click()
  await page.waitForURL(`${BASE_URL}/discover`, { timeout: 5000 })
  await shot(page, '02-discover')

  // Like the top card -> match modal.
  await page.getByRole('button', { name: 'Like' }).last().click()
  await shot(page, '03-match')

  // Safety in the match flow: expand the low-key report affordance, then cancel.
  await page.getByRole('button', { name: /^Report / }).click()
  await page.waitForTimeout(200)
  await shot(page, '03b-match-report')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.waitForTimeout(150)

  // Break the ice -> game screen. The first visit auto-starts the personal
  // "About {Name}" round immediately (no category picker step needed).
  await page.getByRole('button', { name: 'Break the ice' }).click()
  await page.waitForTimeout(600)
  await shot(page, '04-game-question')

  // Answer the first question -> feedback state.
  await page.locator('main button').nth(1).click()
  await page.waitForTimeout(350)
  await shot(page, '05-game-feedback')

  // Play through the remaining questions to reach the end of the personal round.
  for (let i = 0; i < 20; i++) {
    const advance = page.getByRole('button', { name: /Next question|See results/ })
    if (!(await advance.count())) break
    const last = /See results/.test((await advance.textContent()) ?? '')
    await advance.click()
    await page.waitForTimeout(300)
    if (last) break
    await page.locator('main button').nth(1).click()
    await page.waitForTimeout(300)
  }

  // With THAW_PER_GAME = 1.0 the first game fully breaks the ice, so ThawReveal
  // fires immediately. Wait for the melt + shard burst to settle, then grab the
  // money shot before dismissing.
  await page.waitForTimeout(1700)
  await shot(page, '06-thaw-reveal')

  // Dismiss the reveal -> WantToChat with "What you learned about {Name}" panel.
  await page.getByRole('button', { name: /^Meet / }).click()
  await page.waitForTimeout(400)
  await shot(page, '07-want-to-chat')

  // Say "Chat now" -> chat screen (shows conversation starters from the round).
  await page.getByRole('button', { name: 'Chat now' }).click()
  await page.waitForTimeout(400)
  await shot(page, '08-chat')

  // Send a first message -> the thread renders it (local-only chat).
  await page.getByPlaceholder('Type a message…').fill('That science one got us both 😅')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.waitForTimeout(300)
  await shot(page, '08b-chat-message')

  // Safety affordances: open the header menu, then the report & block confirm.
  await page.getByRole('button', { name: 'Safety options' }).click()
  await page.waitForTimeout(200)
  await shot(page, '08e-safety-menu')
  await page.getByRole('menuitem', { name: 'Report & block' }).click()
  await page.waitForTimeout(200)
  await shot(page, '08f-report-confirm')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.waitForTimeout(200)

  // Play a second icebreaker from the chat footer. This time the category picker
  // shows normally (auto-start only fires for the very first game) and the personal
  // round is marked "Played".
  await page.getByRole('link', { name: /Play Icebreaker/ }).click()
  await page.waitForTimeout(300)
  await shot(page, '08g-category-picker')

  // Pick Music and play through.
  await page.getByRole('button', { name: /Music/ }).click()
  await page.waitForTimeout(300)
  await page.locator('main button').nth(1).click()
  await page.waitForTimeout(300)
  for (let i = 0; i < 20; i++) {
    const advance = page.getByRole('button', { name: /Next question|See results/ })
    if (!(await advance.count())) break
    const last = /See results/.test((await advance.textContent()) ?? '')
    await advance.click()
    await page.waitForTimeout(300)
    if (last) break
    await page.locator('main button').nth(1).click()
    await page.waitForTimeout(300)
  }
  // Match is already fully thawed — no ThawReveal fires for the second round.
  await page.waitForTimeout(500)
  await shot(page, '08c-second-game-results')

  // Replay -> category picker (all categories available, personal still "Played").
  await page.getByRole('button', { name: 'Play another game' }).click()
  await page.waitForTimeout(300)
  await shot(page, '08d-replay-picker')

  // Matches list.
  await page.goto(`${BASE_URL}/matches`, { waitUntil: 'networkidle' })
  await shot(page, '09-matches')

  // Profile.
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' })
  await shot(page, '10-profile')

  // Short-phone stress case (iPhone SE).
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '11-se-discover')

  // Desktop framing.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' })
  await shot(page, '12-desktop')

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
