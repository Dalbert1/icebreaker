import type { Profile } from '../types'

/**
 * A profile portrait with the signature "break the ice" frost layer on top:
 * a fresh match (thaw≈0) is iced over and blurred; as trivia is answered the
 * ice clears (thaw→1) and the face is revealed.
 *
 * Base layer = the profile photo (bundled asset). If no photo, falls back to a
 * generated gradient + initial so the component is always safe to render.
 */
export function GradientPortrait({
  profile,
  thaw = 1,
  className = '',
}: {
  profile: Profile
  /** 0 = fully frosted/iced, 1 = fully clear. */
  thaw?: number
  className?: string
}) {
  const [c1, c2] = profile.gradient
  const frost = 1 - Math.max(0, Math.min(1, thaw))
  const uid = `pp-${profile.id}`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* gradient backdrop (shows through letterboxing / while image loads) */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 30%, ${c1}, ${c2})` }}
      />

      {profile.photo ? (
        <img
          src={profile.photo}
          alt={profile.name}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <FallbackArt uid={uid} c1={c1} c2={c2} initial={profile.name.charAt(0)} />
      )}

      {/* frost / ice overlay — strength tracks (1 - thaw) */}
      {frost > 0.01 && (
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            backdropFilter: `blur(${frost * 13}px) brightness(${1 + frost * 0.1})`,
            WebkitBackdropFilter: `blur(${frost * 13}px) brightness(${1 + frost * 0.1})`,
            background: `linear-gradient(135deg, rgba(230,246,255,${frost * 0.34}), rgba(165,233,255,${frost * 0.14}))`,
          }}
        >
          {/* crystalline frost streaks */}
          <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <g stroke="#fff" strokeOpacity={frost * 0.5} strokeWidth="1" fill="none">
              <path d="M0 90 L300 120 M0 200 L300 180 M0 300 L300 330" />
              <path d="M70 0 L90 400 M180 0 L160 400 M250 0 L270 400" strokeOpacity={frost * 0.3} />
            </g>
          </svg>
        </div>
      )}
    </div>
  )
}

function FallbackArt({
  uid,
  c1,
  c2,
  initial,
}: {
  uid: string
  c1: string
  c2: string
  initial: string
}) {
  return (
    <>
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id={`${uid}-bg`} cx="50%" cy="32%" r="80%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
          <linearGradient id={`${uid}-sil`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill={`url(#${uid}-bg)`} />
        <circle cx="150" cy="150" r="62" fill={`url(#${uid}-sil)`} />
        <path d="M55 400 C 55 300, 100 250, 150 250 C 200 250, 245 300, 245 400 Z" fill={`url(#${uid}-sil)`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display text-frost/85"
          style={{ fontSize: 'clamp(3rem, 14vw, 6rem)', textShadow: '0 2px 24px rgba(0,0,0,0.3)' }}
        >
          {initial}
        </span>
      </div>
    </>
  )
}
