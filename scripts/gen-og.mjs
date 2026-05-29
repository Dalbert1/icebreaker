// Generates public/og-image.png for Twitter / Open Graph sharing.
// Run once (or after brand changes): node scripts/gen-og.mjs
// Requires Playwright chromium to be installed (npx playwright install chromium).
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT  = join(ROOT, 'public', 'og-image.png')

const HTML = /* html */ `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #050811;
    font-family: 'Hanken Grotesk', sans-serif;
    color: #e8f4ff;
    position: relative;
  }

  /* Ambient background blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
  }
  .blob-teal  { width: 480px; height: 480px; top: -120px; left: -80px;  background: rgba(45,212,191,0.13); }
  .blob-coral { width: 520px; height: 520px; bottom: -140px; right: -100px; background: rgba(255,108,72,0.11); }
  .blob-ice   { width: 300px; height: 300px; top: 60px; right: 260px; background: rgba(94,211,255,0.09); }

  /* Fine grid overlay */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(94,211,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(94,211,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* Frosted portrait cards */
  .portraits {
    position: absolute;
    right: 64px; top: 50%;
    transform: translateY(-50%);
    display: flex; gap: 20px; align-items: flex-end;
  }
  .card {
    border-radius: 28px;
    overflow: hidden;
    border: 1.5px solid rgba(94,211,255,0.18);
    position: relative;
    flex-shrink: 0;
  }
  .card-inner {
    position: relative;
    display: flex; align-items: flex-end; justify-content: center;
  }
  /* Silhouette */
  .silhouette {
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  }
  /* Frost overlay */
  .frost {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(5,8,17,0.1) 0%, rgba(5,8,17,0.55) 100%);
    backdrop-filter: blur(var(--blur));
  }
  /* Thaw overlay that removes frost from the bottom */
  .thaw-reveal {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: var(--reveal);
    background: transparent;
    backdrop-filter: none;
  }

  .card-a {
    width: 148px; height: 212px;
    --blur: 18px;
    background: linear-gradient(135deg, #1a3a5c 0%, #0d2240 100%);
  }
  .card-b {
    width: 172px; height: 248px;
    --blur: 6px;
    background: linear-gradient(135deg, #1a2e4a 0%, #0c1e38 100%);
  }
  .card-c {
    width: 148px; height: 212px;
    --blur: 14px;
    background: linear-gradient(135deg, #1e2850 0%, #0e1a36 100%);
  }

  /* Silhouettes */
  .sil-a, .sil-b, .sil-c {
    width: 100%; display: block;
  }

  /* Thaw bar on middle card */
  .thaw-bar-wrap {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 0 12px 10px;
  }
  .thaw-bar-track {
    height: 3px; border-radius: 2px;
    background: rgba(255,255,255,0.1);
    overflow: hidden;
  }
  .thaw-bar-fill {
    height: 100%; width: 38%;
    border-radius: 2px;
    background: linear-gradient(90deg, #5ed3ff, #2dd4bf);
  }

  /* Glow line on thawing card */
  .glow-line {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2dd4bf 40%, #5ed3ff 60%, transparent);
    opacity: 0.8;
  }

  /* Initials */
  .initial {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -52%);
    font-family: 'Fraunces', serif;
    font-size: 44px; font-weight: 300;
    color: rgba(232,244,255,0.25);
    letter-spacing: -1px;
  }

  /* Left content */
  .content {
    position: absolute;
    left: 72px; top: 50%;
    transform: translateY(-50%);
    max-width: 560px;
  }

  .eyebrow {
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(94,211,255,0.7);
    margin-bottom: 18px;
  }

  .wordmark {
    font-family: 'Fraunces', serif;
    font-size: 96px; font-weight: 300;
    line-height: 0.92;
    letter-spacing: -3px;
    color: #e8f4ff;
  }
  .wordmark span {
    background: linear-gradient(135deg, #5ed3ff 0%, #2dd4bf 45%, #ff8e72 80%, #ffb454 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    margin-top: 24px;
    font-size: 20px; font-weight: 400;
    color: rgba(232,244,255,0.55);
    letter-spacing: 0.02em;
    line-height: 1.4;
  }
  .tagline strong {
    color: rgba(232,244,255,0.82);
    font-weight: 500;
  }

  /* Pills */
  .pills {
    margin-top: 32px;
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .pill {
    padding: 7px 16px;
    border-radius: 100px;
    border: 1px solid rgba(94,211,255,0.2);
    background: rgba(94,211,255,0.06);
    font-size: 13px; font-weight: 500;
    color: rgba(232,244,255,0.65);
    letter-spacing: 0.01em;
  }
  .pill-accent {
    border-color: rgba(45,212,191,0.4);
    background: rgba(45,212,191,0.1);
    color: #2dd4bf;
  }

  /* Divider line */
  .divider {
    position: absolute;
    left: 72px; right: 72px; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,211,255,0.15) 30%, rgba(255,142,114,0.15) 70%, transparent);
  }

  /* Bottom bar */
  .bottom-bar {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 48px;
    background: rgba(5,8,17,0.6);
    border-top: 1px solid rgba(94,211,255,0.08);
    display: flex; align-items: center;
    padding: 0 72px;
    gap: 6px;
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #2dd4bf; opacity: 0.7; }
  .bottom-text {
    font-size: 13px; color: rgba(232,244,255,0.35);
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
  <div class="blob blob-teal"></div>
  <div class="blob blob-coral"></div>
  <div class="blob blob-ice"></div>
  <div class="grid"></div>

  <!-- Left: wordmark + tagline -->
  <div class="content">
    <p class="eyebrow">✦ a new kind of dating app</p>
    <h1 class="wordmark">ice<span>breaker</span></h1>
    <p class="tagline">
      <strong>Break the ice with trivia.</strong><br/>
      Then find your match.
    </p>
    <div class="pills">
      <span class="pill">🧊 frosted profiles</span>
      <span class="pill pill-accent">❤ trivia + connect</span>
      <span class="pill">🌊 thaw together</span>
    </div>
  </div>

  <!-- Right: frosted portrait stack -->
  <div class="portraits">
    <!-- Card A: very frosted -->
    <div class="card card-a">
      <div class="card-inner" style="width:148px;height:212px;">
        <div class="initial">S</div>
        <!-- Frost overlay -->
        <div style="position:absolute;inset:0;backdrop-filter:blur(18px);background:rgba(5,8,17,0.35);border-radius:28px;"></div>
        <!-- Ice crack lines -->
        <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.15" viewBox="0 0 148 212" fill="none">
          <path d="M74 20 L80 80 L110 90 L74 150 L50 120 L74 80" stroke="#5ed3ff" stroke-width="1"/>
          <path d="M40 60 L74 80 M110 90 L130 140" stroke="#5ed3ff" stroke-width="0.7" opacity="0.6"/>
        </svg>
      </div>
    </div>

    <!-- Card B: mid-thaw (center, tallest) -->
    <div class="card card-b" style="border-color:rgba(45,212,191,0.35);">
      <div class="card-inner" style="width:172px;height:248px;">
        <!-- Gradient bg simulating a revealed person -->
        <div style="position:absolute;inset:0;background:linear-gradient(160deg,#1a3a5c 0%,#0d2a44 60%,#0a1e35 100%);"></div>
        <!-- Partial silhouette revealed -->
        <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:120px;height:160px;opacity:0.55" viewBox="0 0 120 160" fill="none">
          <ellipse cx="60" cy="38" rx="22" ry="26" fill="#2dd4bf" opacity="0.6"/>
          <path d="M24 160 Q24 100 60 95 Q96 100 96 160Z" fill="#2dd4bf" opacity="0.45"/>
        </svg>
        <!-- Partial frost (top half remains, bottom thawing) -->
        <div style="position:absolute;top:0;left:0;right:0;height:55%;backdrop-filter:blur(8px);background:rgba(5,8,17,0.25);border-radius:28px 28px 0 0;"></div>
        <!-- Initial (partially visible) -->
        <div style="position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);font-family:'Fraunces',serif;font-size:52px;font-weight:300;color:rgba(232,244,255,0.4);">M</div>
        <!-- Glow line -->
        <div class="glow-line"></div>
        <!-- Thaw bar -->
        <div class="thaw-bar-wrap">
          <div class="thaw-bar-track"><div class="thaw-bar-fill"></div></div>
        </div>
      </div>
    </div>

    <!-- Card C: very frosted -->
    <div class="card card-c">
      <div class="card-inner" style="width:148px;height:212px;">
        <div class="initial">J</div>
        <div style="position:absolute;inset:0;backdrop-filter:blur(16px);background:rgba(5,8,17,0.32);border-radius:28px;"></div>
        <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.12" viewBox="0 0 148 212" fill="none">
          <path d="M74 15 L85 75 L120 85 L74 155 L40 110 L65 75" stroke="#5ed3ff" stroke-width="1"/>
          <path d="M30 70 L65 75 M120 85 L140 130" stroke="#5ed3ff" stroke-width="0.7" opacity="0.6"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Bottom bar -->
  <div class="bottom-bar">
    <div class="dot"></div>
    <span class="bottom-text">icebreaker · break the ice, find your match</span>
  </div>
</body>
</html>`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(HTML, { waitUntil: 'networkidle' })
await page.waitForTimeout(800) // let fonts + blur settle
const buf = await page.screenshot({ type: 'png' })
await browser.close()

writeFileSync(OUT, buf)
console.log(`✓ og-image.png written to ${OUT}`)
