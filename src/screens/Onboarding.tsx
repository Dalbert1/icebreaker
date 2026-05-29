import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useStore, type GenderPreference } from '../lib/store'
import { Wordmark } from '../components/ui'

const options: { value: GenderPreference; label: string; emoji: string; sub: string }[] = [
  { value: 'female', label: 'Women', emoji: '✨', sub: 'Show me women' },
  { value: 'male', label: 'Men', emoji: '⚡', sub: 'Show me men' },
  { value: 'both', label: 'Everyone', emoji: '🌊', sub: 'Show me everyone' },
]

export function Onboarding() {
  const { state, isSupabaseConfigured, setPreference, signInWithEmail, signOut } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function choose(pref: GenderPreference) {
    setPreference(pref)
    navigate('/discover', { replace: true })
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await signInWithEmail(email.trim())
    setSubmitting(false)
  }

  return (
    <div className="no-scrollbar flex h-full flex-col items-center overflow-y-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <Wordmark size="lg" />
        <p className="text-center text-sm text-frost/55">
          Break the ice with people you actually want to meet.
        </p>
      </motion.div>

      {isSupabaseConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass mt-7 w-full max-w-xs p-4"
          style={{ borderRadius: '22px' }}
        >
          <p className="text-[11px] uppercase tracking-wider text-amber/80">
            Account
          </p>
          {state.auth.userId ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-frost">{state.auth.email}</p>
                <p className="text-xs text-frost/45">
                  {state.auth.status === 'needsProfile' ? 'Ready for profile setup' : 'Signed in with Supabase'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="shrink-0 rounded-full border border-frost/12 px-3 py-1.5 text-xs text-frost/60"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={submitEmail} className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="rounded-2xl border border-frost/12 bg-frost/5 px-4 py-3 text-sm text-frost placeholder-frost/30 outline-none focus:border-ice/50"
              />
              <button
                disabled={submitting || !email.trim()}
                className="bg-thaw rounded-2xl py-3 text-sm font-semibold text-abyss transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Email me a sign-in link'}
              </button>
            </form>
          )}
          {(state.auth.message || state.auth.error) && (
            <p className={`mt-2 text-xs ${state.auth.error ? 'text-ember' : 'text-ice/75'}`}>
              {state.auth.error ?? state.auth.message}
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 w-full max-w-xs"
      >
        <h2 className="mb-6 text-center text-2xl text-frost">
          Who are you interested in?
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
              onClick={() => choose(opt.value)}
              className="glass flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all hover:border-ice/40 active:scale-[0.98]"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <div className="font-semibold text-frost">{opt.label}</div>
                <div className="text-xs text-frost/50">{opt.sub}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <p className="mt-auto pt-8 text-center text-xs text-frost/30">
        You can change this anytime in your profile.
      </p>
    </div>
  )
}
