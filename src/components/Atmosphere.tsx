/**
 * The "frozen palace" backdrop: a deep blue-violet winter sky with drifting
 * aurora glows, a faint northern-lights band, and gently falling snow. Purely
 * decorative and fixed behind everything (pointer-events: none). Snow positions
 * are derived from the index (no randomness) so visual screenshots stay stable.
 */
const SNOW = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37.5) % 100,
  size: 2 + (i % 4), // 2–5px
  duration: 9 + (i % 7), // 9–15s
  delay: -((i % 11) * 1.4), // negative -> already mid-fall on first paint
  drift: ((i % 5) - 2) * 14, // -28..28px
  opacity: 0.45 + (i % 4) * 0.16, // 0.45–0.93
}))

export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-abyss grain">
      {/* vignette (behind the glows so it darkens the base, not the aurora) */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(125% 95% at 50% 8%, transparent 45%, var(--color-abyss) 100%)' }}
      />

      {/* glacial top glow */}
      <div
        className="absolute -top-24 -left-16 h-[62vh] w-[62vh] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-glacial) 60%, transparent), transparent 70%)',
          animation: 'float-slow 14s var(--ease-out-soft) infinite',
        }}
      />
      {/* aurora violet glow, lower right — the magic / the "thaw" */}
      <div
        className="absolute -bottom-32 -right-20 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-aurora) 55%, transparent), transparent 70%)',
          animation: 'drift 18s var(--ease-out-soft) infinite',
        }}
      />
      {/* teal mid accent */}
      <div
        className="absolute top-1/3 left-1/2 h-[45vh] w-[45vh] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-teal) 32%, transparent), transparent 70%)',
          animation: 'float-slow 22s var(--ease-out-soft) infinite reverse',
        }}
      />
      {/* northern-lights band sweeping across the upper sky */}
      <div
        className="absolute -top-10 left-[-20%] h-[38vh] w-[140%] rotate-[-8deg] blur-3xl opacity-55"
        style={{
          background:
            'linear-gradient(100deg, transparent, color-mix(in oklab, var(--color-glacial) 38%, transparent) 30%, color-mix(in oklab, var(--color-aurora) 40%, transparent) 55%, color-mix(in oklab, var(--color-teal) 32%, transparent) 75%, transparent)',
          animation: 'drift 26s var(--ease-out-soft) infinite',
        }}
      />

      {/* drifting snow */}
      {SNOW.map((s, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-frost"
          style={{
            left: `${s.left}%`,
            height: s.size,
            width: s.size,
            // @ts-expect-error custom props consumed by the snow-fall keyframe
            '--snow-drift': `${s.drift}px`,
            '--snow-opacity': s.opacity,
            filter: 'blur(0.4px)',
            boxShadow: '0 0 6px color-mix(in oklab, var(--color-frost) 70%, transparent)',
            animation: `snow-fall ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
