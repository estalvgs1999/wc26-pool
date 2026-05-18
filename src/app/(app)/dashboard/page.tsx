import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Trophy, ChevronRight, Users, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown'
import type { Profile, PredictionGroup, Match } from '@/types'

type RecentPred = PredictionGroup & {
  matches: Pick<Match, 'home_team' | 'away_team' | 'score_home' | 'score_away' | 'status'> | null
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const poolId = await getActivePoolId()

  const [profileRes, matchStatsRes, firstMatchRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('id').eq('stage', 'group'),
    supabase.from('matches')
      .select('scheduled_at').eq('stage', 'group')
      .order('scheduled_at', { ascending: true }).limit(1).maybeSingle(),
  ])

  const profile      = profileRes.data as Profile | null
  const totalMatches = matchStatsRes.data?.length ?? 0
  const firstMatch   = firstMatchRes.data as { scheduled_at: string } | null

  let pool:           { id: string; name: string } | null = null
  let poolRank:       number = 0
  let poolSize:       number = 0
  let predictedCount: number = 0
  let recent:         RecentPred[] = []

  if (poolId) {
    const [poolRes, membersRes, predsCountRes, recentRes] = await Promise.all([
      (supabase.from('pools') as ReturnType<typeof supabase.from>)
        .select('id, name').eq('id', poolId).maybeSingle(),

      supabase.from('pool_members').select('user_id').eq('pool_id', poolId),

      (supabase.from('predictions_groups') as ReturnType<typeof supabase.from>)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pool_id', poolId),

      (supabase.from('predictions_groups') as ReturnType<typeof supabase.from>)
        .select('*, matches(home_team, away_team, score_home, score_away, status)')
        .eq('user_id', user.id)
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

    pool           = poolRes.data as { id: string; name: string } | null
    const members  = (membersRes.data ?? []) as { user_id: string }[]
    poolSize       = members.length
    predictedCount = (predsCountRes as { count: number | null }).count ?? 0
    recent         = (recentRes.data ?? []) as RecentPred[]

    if (members.length > 0) {
      const memberIds = members.map(m => m.user_id)
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, total_points')
        .in('id', memberIds)
        .order('total_points', { ascending: false })

      const sorted = (memberProfiles ?? []) as Pick<Profile, 'id' | 'total_points'>[]
      const myIdx  = sorted.findIndex(p => p.id === user.id)
      poolRank     = myIdx >= 0 ? myIdx + 1 : sorted.length + 1
    }
  }

  const pct = totalMatches > 0 ? (predictedCount / totalMatches) * 100 : 0

  return (
    <div className="flex flex-col min-h-dvh pb-2">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--wc-navy)' }}>
        {/* Stadium spotlights */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[140%] h-64 rounded-full opacity-100 blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,85,184,0.45) 0%, transparent 70%)' }}
          />
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-30 blur-3xl"
            style={{ background: '#006847', transform: 'translate(-40%, -30%)' }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-25 blur-3xl"
            style={{ background: '#CE1126', transform: 'translate(35%, -25%)' }}
          />
        </div>

        {/* Pitch grid overlay */}
        <div className="absolute inset-0 pitch-grid opacity-60 pointer-events-none" />

        <div className="relative px-4 pt-10 pb-8">
          {/* Supertitle */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,85,184,0.50))' }}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
              Canadá · México · USA 2026
            </span>
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, rgba(0,85,184,0.50), transparent)' }}
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.20em] mb-1"
                style={{ color: 'rgba(0,170,255,0.60)' }}>
                FIFA World Cup™
              </p>
              <h1 className="text-3xl font-black text-white leading-none tracking-tight">
                {profile?.username ?? 'Jugador'}
              </h1>
              {pool ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1 h-3 rounded-full" style={{ background: '#0055B8' }} />
                  <p className="text-xs font-semibold text-white/50 truncate">{pool.name}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-sm">🇲🇽</span>
                  <span className="text-sm">🇨🇦</span>
                  <span className="text-sm">🇺🇸</span>
                </div>
              )}
            </div>

            <div className="relative w-14 shrink-0" style={{ height: '4.5rem' }}>
              <Image
                src="/wc26-emblem.png"
                alt="WC2026"
                fill
                priority
                sizes="56px"
                className="object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 16px rgba(0,85,184,0.50))' }}
              />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <StatCard
              label="Puntos"
              value={profile?.total_points ?? 0}
              sub="acumulados"
              accentColor="#F5A623"
              icon={<Star className="w-3.5 h-3.5" style={{ color: '#F5A623' }} />}
            />
            {pool ? (
              <StatCard
                label="Posición"
                value={poolRank > 0 ? `#${poolRank}` : '—'}
                sub={`de ${poolSize} jugadores`}
                accentColor="#0055B8"
                icon={<Users className="w-3.5 h-3.5" style={{ color: '#4499FF' }} />}
              />
            ) : (
              <StatCard
                label="Posición"
                value="—"
                sub="sin quiniela activa"
                accentColor="#0055B8"
                icon={<Users className="w-3.5 h-3.5" style={{ color: '#4499FF' }} />}
              />
            )}
          </div>
        </div>

        {/* Bottom edge: tricolor line */}
        <div className="h-[2px] w-full tricolor-bar opacity-60" />
      </div>

      {/* Tournament countdown */}
      {firstMatch && (
        <DeadlineCountdown deadline={firstMatch.scheduled_at} />
      )}

      <div className="px-4 pt-5 space-y-4">

        {/* No active pool CTA */}
        {!pool && (
          <Link
            href="/pools"
            className="flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,85,184,0.14) 0%, rgba(1,9,21,0.95) 100%)',
              borderColor: 'rgba(0,120,255,0.28)',
              boxShadow: 'inset 0 1px 0 rgba(100,170,255,0.10)',
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{
                background: 'linear-gradient(145deg, rgba(0,85,184,0.50) 0%, rgba(0,50,140,0.60) 100%)',
                border: '1px solid rgba(0,120,255,0.30)',
              }}>
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white/90">Únete a una quiniela</p>
              <p className="text-xs text-white/35 mt-0.5">Selecciona o crea una para competir</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
          </Link>
        )}

        {/* Group stage progress */}
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: 'rgba(0,140,255,0.70)' }} />
              <span className="text-sm font-bold text-white/80">Fase de Grupos</span>
            </div>
            <Link
              href="/matches"
              className="flex items-center gap-0.5 text-xs font-bold tracking-wide transition-colors"
              style={{ color: '#F5A623' }}
            >
              Predecir <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full h-1.5 rounded-full overflow-hidden mb-2.5"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #0055B8, #00A3FF)',
                boxShadow: '0 0 8px rgba(0,163,255,0.50)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/35">
              {predictedCount} / {totalMatches} partidos
            </p>
            <p className="text-xs font-bold" style={{ color: 'rgba(0,163,255,0.70)' }}>
              {pct === 100 ? '¡Completado!' : `${Math.round(pct)}%`}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            href="/matches"
            icon={<CalendarDays className="w-5 h-5" />}
            label="Partidos"
            sub="Predice el marcador"
            gradient="linear-gradient(145deg, rgba(0,85,184,0.50) 0%, rgba(0,40,120,0.60) 100%)"
            borderColor="rgba(0,120,255,0.30)"
            iconBg="rgba(0,85,184,0.35)"
          />
          <ActionCard
            href="/bracket"
            icon={<Trophy className="w-5 h-5" />}
            label="Bracket"
            sub="Arma tu llave"
            gradient="linear-gradient(145deg, rgba(120,60,0,0.50) 0%, rgba(80,30,0,0.60) 100%)"
            borderColor="rgba(245,166,35,0.25)"
            iconBg="rgba(245,166,35,0.15)"
          />
        </div>

        {/* Pool link (when pool active) */}
        {pool && (
          <Link
            href="/pools"
            className="flex items-center gap-3 glass px-4 py-3.5 hover:bg-white/5 active:scale-[0.98] transition-all"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{
                background: 'linear-gradient(145deg, rgba(0,85,184,0.40) 0%, rgba(0,40,120,0.50) 100%)',
                border: '1px solid rgba(0,120,255,0.25)',
              }}>
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white/90 truncate">{pool.name}</p>
              <p className="text-xs text-white/35 mt-0.5">{poolSize} participantes · Cambiar quiniela</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
          </Link>
        )}

        {/* Recent activity */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">
              Actividad reciente
            </h2>
            <ul className="space-y-2">
              {recent.map((pred) => {
                const match = pred.matches
                if (!match) return null
                return (
                  <li key={pred.id} className="glass px-4 py-3 flex items-center justify-between">
                    <p className="text-sm text-white/65 truncate">
                      {match.home_team} – {match.away_team}
                    </p>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs text-white/35 font-mono tabular-nums">
                        {pred.pred_home} – {pred.pred_away}
                      </span>
                      {match.status === 'finished' && pred.points_earned > 0 && (
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>
                          +{pred.points_earned}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accentColor, icon }: {
  label: string; value: string | number; sub: string; accentColor: string; icon: React.ReactNode
}) {
  return (
    <div className="glass p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] text-white/35 uppercase tracking-widest font-black">{label}</span>
      </div>
      <p className="text-3xl font-black text-white leading-none"
        style={{ textShadow: `0 0 24px ${accentColor}50` }}>
        {value}
      </p>
      <p className="text-xs text-white/25 mt-0.5">{sub}</p>
    </div>
  )
}

function ActionCard({ href, icon, label, sub, gradient, borderColor, iconBg }: {
  href: string; icon: React.ReactNode; label: string; sub: string
  gradient: string; borderColor: string; iconBg: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2.5 p-4 rounded-2xl border transition-all active:scale-[0.97]"
      style={{
        background: gradient,
        borderColor,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80"
        style={{ background: iconBg, border: `1px solid ${borderColor}` }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{sub}</p>
      </div>
    </Link>
  )
}
