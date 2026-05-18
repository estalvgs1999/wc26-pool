'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register'

function AuthForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const nextUrl      = params.get('next') ?? '/dashboard'

  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Correo o contraseña incorrectos.')
        setLoading(false)
        return
      }
    } else {
      if (username.trim().length < 2) {
        setError('El nombre debe tener al menos 2 caracteres.')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        setLoading(false)
        return
      }
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      })
      if (authError) {
        setError(authError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese correo.'
          : authError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = nextUrl
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
  }

  return (
    <div className="min-h-dvh flex flex-col wc-hero safe-pt safe-pb">

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 px-5 pitch-grid">
        {/* Official WC2026 emblem */}
        <div className="mb-5 drop-shadow-2xl">
          <Image
            src="/wc26-emblem.png"
            alt="FIFA World Cup 2026"
            width={110}
            height={170}
            priority
            style={{ height: 'auto' }}
          />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">WC26 Pool</h1>
        <p className="text-sm text-white/50 mt-1 mb-4">Quiniela del Mundial 2026</p>

        {/* Host nations */}
        <div className="flex items-center gap-2">
          {['🇲🇽', '🇨🇦', '🇺🇸'].map((flag) => (
            <span key={flag} className="text-2xl">{flag}</span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex flex-col px-5 pb-8">
        {/* Tricolor accent bar */}
        <div className="h-0.5 mb-6 rounded-full mx-auto w-24"
          style={{ background: 'linear-gradient(90deg, #006847, white, #CE1126)' }}
        />

        {/* Tabs */}
        <div className="flex rounded-2xl border border-white/10 p-1 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                mode === m
                  ? 'bg-white text-wc-navy shadow-sm'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 flex-1">
          <div className="space-y-3 rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.04)' }}>

            {/* Username — register only */}
            {mode === 'register' && (
              <Field label="Nombre">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="nickname"
                  placeholder="Ej: Luis, ElToro99…"
                  className={inputCls}
                />
              </Field>
            )}

            <Field label="Correo">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className={inputCls}
              />
            </Field>

            <Field label="Contraseña">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className={cn(inputCls, 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border px-4 py-3"
              style={{ background: 'rgba(206,17,38,0.10)', borderColor: 'rgba(206,17,38,0.25)' }}>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password || (mode === 'register' && !username)}
            className={cn(
              'w-full h-12 rounded-2xl font-black text-sm tracking-wide',
              'text-white transition-all duration-200',
              'active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2',
            )}
            style={{
              background: 'linear-gradient(135deg, #0055B8 0%, #0070E0 50%, #0055B8 100%)',
              boxShadow: '0 4px 24px rgba(0,85,184,0.40)',
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar al Mundial'
            ) : (
              'Unirme al Mundial'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-6">
          WC26 Pool · USA · Canada · México
        </p>
      </div>
    </div>
  )
}

const inputCls = cn(
  'w-full h-11 rounded-xl px-3.5 text-sm',
  'bg-white/10 border border-white/10',
  'text-white placeholder-white/30',
  'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/25',
  'transition-all duration-150',
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-white/40 mb-1.5 block uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
