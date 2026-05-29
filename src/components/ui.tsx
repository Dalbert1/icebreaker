import type { ReactNode } from 'react'
import type { Vibe } from '../types'

/** App wordmark — a faceted crystal glyph + "icebreaker" in the display face. */
export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const text = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }[size]
  const glyph = { sm: 20, md: 26, lg: 40 }[size]
  return (
    <div className="flex items-center gap-2">
      <svg width={glyph} height={glyph} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="wm" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5ed3ff" />
            <stop offset="0.55" stopColor="#9d8cff" />
            <stop offset="1" stopColor="#ffc97a" />
          </linearGradient>
        </defs>
        <path d="M32 6 L54 26 L41 58 L23 58 L10 26 Z" stroke="url(#wm)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 6 L29 31 L41 35 L31 58" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      </svg>
      <span className={`font-display ${text} tracking-tight text-frost`}>
        ice<span className="text-thaw">breaker</span>
      </span>
    </div>
  )
}

export function VibePill({ vibe }: { vibe: Vibe }) {
  return (
    <span className="rounded-full border border-frost/15 bg-frost/5 px-3 py-1 text-xs font-medium text-ice/90">
      {vibe}
    </span>
  )
}

/** The "ice meter" — shows how thawed a connection is. */
export function ThawBar({ thaw, showLabel = true }: { thaw: number; showLabel?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, thaw)) * 100)
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-frost/50">
          <span>{pct === 0 ? 'Iced over' : pct >= 100 ? 'Ice broken' : 'Thawing'}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-frost/10">
        <div
          className="h-full rounded-full bg-thaw transition-all duration-700"
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
    </div>
  )
}

/** Frosted-glass surface wrapper. */
export function Glass({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`glass rounded-3xl ${className}`} style={{ borderRadius: 'var(--radius-card)' }}>
      {children}
    </div>
  )
}
