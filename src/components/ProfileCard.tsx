import type { Profile } from '../types'
import { GradientPortrait } from './GradientPortrait'
import { VibePill } from './ui'

// Product-review prototype: Discover can hide real photos behind a 0% thaw state
// without changing matched/game portrait reveal behavior.
const DISCOVER_CARD_THAW = 0
const DISCOVER_CARD_REVEAL_PHOTO = false

/** The visual face of a profile in the discovery deck. */
export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-glacier shadow-2xl"
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      <div className="absolute inset-0">
        <GradientPortrait
          profile={profile}
          thaw={DISCOVER_CARD_THAW}
          revealPhoto={DISCOVER_CARD_REVEAL_PHOTO}
          className="h-full w-full"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,color-mix(in_oklab,var(--color-frost)_22%,transparent),transparent_42%),linear-gradient(135deg,color-mix(in_oklab,var(--color-glacial)_18%,transparent),transparent_45%,color-mix(in_oklab,var(--color-aurora)_16%,transparent))]" />

      {!DISCOVER_CARD_REVEAL_PHOTO && (
        <svg
          viewBox="0 0 240 320"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute left-1/2 top-[13%] h-[43%] max-h-80 w-[58%] -translate-x-1/2 text-frost/35 mix-blend-soft-light"
          aria-hidden
        >
          <circle cx="120" cy="104" r="54" fill="currentColor" />
          <path d="M36 306 C 42 218, 76 178, 120 178 C 164 178, 198 218, 204 306 Z" fill="currentColor" />
        </svg>
      )}

      {/* readability scrim */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(5,8,17,0.92) 8%, rgba(5,8,17,0.25) 45%, transparent 70%)' }}
      />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-end gap-2">
          <h2 className="text-3xl text-frost">{profile.name}</h2>
          <span className="mb-1 text-2xl font-light text-frost/80">{profile.age}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ice/80">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {profile.location}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-frost/85">{profile.bio}</p>

        <div className="mt-3 rounded-2xl border border-frost/10 bg-frost/5 p-3">
          <p className="text-[11px] uppercase tracking-wider text-amber/80">{profile.prompt.question}</p>
          <p className="mt-0.5 text-sm text-frost/90">{profile.prompt.answer}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.vibes.map((v) => (
            <VibePill key={v} vibe={v} />
          ))}
        </div>
      </div>
    </div>
  )
}
