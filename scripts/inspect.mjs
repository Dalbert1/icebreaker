import { chromium } from '@playwright/test'
const URL = process.env.URL ?? 'http://localhost:4173/icebreaker/discover'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`))
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const rootChildren = await page.evaluate(() => document.getElementById('root')?.childElementCount ?? -1)
console.log('URL:', URL)
console.log('#root children:', rootChildren)
console.log('logs:')
for (const l of logs) console.log('  ', l)
await browser.close()
