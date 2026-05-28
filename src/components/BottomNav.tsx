import { NavLink } from 'react-router-dom'
import { useStore } from '../lib/store'

const tabs = [
  {
    to: '/discover',
    label: 'Discover',
    icon: (
      <path d="M5 5h11a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5Z M5 5 3 7v9a4 4 0 0 0 4 4h8" />
    ),
  },
  {
    to: '/matches',
    label: 'Matches',
    icon: (
      <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z" />
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21a8 8 0 0 1 16 0" />
    ),
  },
]

export function BottomNav() {
  const { state } = useStore()
  const matchCount = state.matches.length

  return (
    <nav className="glass sticky bottom-0 z-20 mx-auto flex w-full items-center justify-around rounded-t-3xl px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-frost' : 'text-frost/45 hover:text-frost/70'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {t.icon}
                </svg>
                {t.to === '/matches' && matchCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-abyss">
                    {matchCount}
                  </span>
                )}
              </span>
              {t.label}
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-thaw" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
