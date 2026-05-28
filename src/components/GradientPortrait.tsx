import type { Profile } from '../types'

/**
 * A locally-generated, on-theme "portrait" for a profile — no network images.
 * It's an abstract gradient field with a soft silhouette and the person's
 * initial. A frost layer sits on top whose strength = (1 - thaw): a fresh match
 * is iced over and blurred; as trivia is answered the ice clears. This is the
 * literal "break the ice" mechanic.
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
        {/* faceted ice planes for depth */}
        <polygon points="0,0 160,0 60,160" fill="#fff" opacity="0.06" />
        <polygon points="300,0 300,180 150,90" fill="#000" opacity="0.07" />
        <polygon points="0,400 0,220 130,400" fill="#fff" opacity="0.05" />
        {/* soft head-and-shoulders silhouette */}
        <circle cx="150" cy="150" r="62" fill={`url(#${uid}-sil)`} />
        <path
          d="M55 400 C 55 300, 100 250, 150 250 C 200 250, 245 300, 245 400 Z"
          fill={`url(#${uid}-sil)`}
        />
      </svg>

      {/* initial */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display text-frost/85"
          style={{ fontSize: 'clamp(3rem, 14vw, 6rem)', textShadow: '0 2px 24px rgba(0,0,0,0.3)' }}
        >
          {profile.name.charAt(0)}
        </span>
      </div>

      {/* frost / ice overlay — strength tracks (1 - thaw) */}
      {frost > 0.01 && (
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            backdropFilter: `blur(${frost * 14}px) brightness(${1 + frost * 0.15})`,
            WebkitBackdropFilter: `blur(${frost * 14}px) brightness(${1 + frost * 0.15})`,
            background: `linear-gradient(135deg, rgba(230,246,255,${frost * 0.35}), rgba(165,233,255,${frost * 0.12}))`,
          }}
        >
          {/* crystalline frost streaks */}
          <svg viewBox="0 0 300 400" className="h-full w-full" aria-hidden>
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
