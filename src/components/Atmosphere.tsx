/**
 * The polar-dusk backdrop: layered aurora glows drifting behind a dark glacial
 * base, plus a faint grain overlay to kill gradient banding. Purely decorative
 * and fixed behind everything (pointer-events: none).
 */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-abyss grain">
      {/* glacial top glow */}
      <div
        className="absolute -top-32 -left-24 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-glacial) 55%, transparent), transparent 70%)',
          animation: 'float-slow 14s var(--ease-out-soft) infinite',
        }}
      />
      {/* warm ember glow, lower right — the "thaw" */}
      <div
        className="absolute -bottom-40 -right-28 h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-ember) 45%, transparent), transparent 70%)',
          animation: 'drift 18s var(--ease-out-soft) infinite',
        }}
      />
      {/* teal mid accent */}
      <div
        className="absolute top-1/3 left-1/2 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-teal) 30%, transparent), transparent 70%)',
          animation: 'float-slow 22s var(--ease-out-soft) infinite reverse',
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 10%, transparent 40%, var(--color-abyss) 100%)' }}
      />
    </div>
  )
}
