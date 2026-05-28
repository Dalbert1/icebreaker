import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const out = await page.evaluate(() => {
  // The top deck card is the last `.absolute.inset-0 > svg` painted.
  const svgs = [...document.querySelectorAll('svg')].filter((s) =>
    s.querySelector('rect[fill^="url"]'),
  )
  const svg = svgs[svgs.length - 1]
  if (!svg) return { err: 'no portrait svg' }
  const rect = svg.querySelector('rect')
  const box = rect.getBoundingClientRect()
  const grad = svg.querySelector('radialGradient')
  return {
    rectFillAttr: rect.getAttribute('fill'),
    computedFill: getComputedStyle(rect).fill,
    rectBox: { w: Math.round(box.width), h: Math.round(box.height) },
    gradInSameSvg: grad?.id,
    defsHasGrad: !!svg.querySelector('defs radialGradient'),
    svgHTMLstart: svg.outerHTML.slice(0, 220),
  }
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
