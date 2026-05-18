import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Medal } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'
import type { Profile } from '@/types'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

type RankedPlayer = Pick<Profile, 'id' | 'username' | 'avatar_url' | 'total_points'> & { rank: number }

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const poolId = await getActivePoolId()

  if (!poolId) {
    return (
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: 'rgba(0,140,255,0.55)' }}>
              FIFA World Cup™
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">Tabla</h1>
            <p className="text-xs text-white/35 mt-0.5 font-medium">Posiciones de tu quiniela</p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.22)' }}>
            <Medal className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-sm font-bold text-white/60">Sin quiniela activa</p>
          <p className="text-xs text-white/30 max-w-[220px]">
            Selecciona o crea una quiniela para ver la tabla de posiciones.
          </p>
          <Link
            href="/pools"
            className="mt-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'rgba(0,85,184,0.20)', border: '1px solid rgba(0,120,255,0.28)' }}
          >
            Ir a Quinielas
          </Link>
        </div>
      </div>
    )
  }

  const [poolRes, membersRes] = await Promise.all([
    (supabase.from('pools') as ReturnType<typeof supabase.from>)
      .select('id, name').eq('id', poolId).maybeSingle(),
    supabase.from('pool_members').select('user_id').eq('pool_id', poolId),
  ])

  const pool      = poolRes.data as { id: string; name: string } | null
  const memberIds = (membersRes.data ?? []).map((m: { user_id: string }) => m.user_id)

  const { data } = memberIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_points')
        .in('id', memberIds)
        .order('total_points', { ascending: false })
        .limit(50)
    : { data: [] }

  const players = (data ?? []) as Pick<Profile, 'id' | 'username' | 'avatar_url' | 'total_points'>[]
  const ranked: RankedPlayer[] = players.map((p, i) => ({ ...p, rank: i + 1 }))
  const me     = ranked.find((p) => p.id === user.id)
  const leader = ranked[0] ?? null

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: 'rgba(0,140,255,0.55)' }}>
            FIFA World Cup™
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight">Tabla</h1>
          <p className="text-xs text-white/35 mt-0.5 font-medium">
            {pool?.name ?? 'Quiniela'} · {ranked.length} participantes
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.22)' }}>
          <Medal className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* My position callout (if not in top 3) */}
      {me && me.rank > 3 && leader && (
        <div className="mb-4 p-4 rounded-2xl border flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(0,85,184,0.15) 0%, rgba(1,9,21,0.90) 100%)',
            borderColor: 'rgba(0,120,255,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(100,170,255,0.10)',
          }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(100,170,255,0.60)' }}>Tu posición</p>
            <p className="text-xl font-black text-white">#{me.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 mb-0.5">{me.total_points} pts</p>
            <p className="text-xs" style={{ color: 'rgba(255,100,100,0.70)' }}>
              -{leader.total_points - me.total_points} del líder
            </p>
          </div>
        </div>
      )}

      {/* Ranking list */}
      <ul className="space-y-2">
        {ranked.map((player) => {
          const isMe   = player.id === user.id
          const medal  = MEDAL[player.rank]
          const gapPts = leader ? leader.total_points - player.total_points : 0

          return (
            <li key={player.id}>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
                style={isMe ? {
                  background: 'linear-gradient(135deg, rgba(0,85,184,0.18) 0%, rgba(1,9,21,0.90) 100%)',
                  borderColor: 'rgba(0,120,255,0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(100,170,255,0.12)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="w-8 text-center shrink-0">
                  {medal ? (
                    <span className="text-lg">{medal}</span>
                  ) : (
                    <span className="text-sm font-black" style={{ color: isMe ? 'rgba(100,170,255,0.90)' : 'rgba(255,255,255,0.30)' }}>
                      {player.rank}
                    </span>
                  )}
                </div>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={isMe ? {
                    background: 'rgba(0,85,184,0.35)',
                    color: 'rgba(100,170,255,0.90)',
                    border: '1px solid rgba(0,120,255,0.30)',
                  } : {
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {player.username.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: isMe ? 'rgba(150,200,255,0.95)' : 'rgba(255,255,255,0.85)' }}>
                    {player.username}
                    {isMe && <span className="text-[10px] ml-1.5" style={{ color: 'rgba(100,170,255,0.50)' }}>(tú)</span>}
                  </p>
                  {player.rank > 1 && gapPts > 0 && (
                    <p className="text-[10px] text-white/25">-{gapPts} del líder</p>
                  )}
                </div>

                <p className="text-base font-black shrink-0" style={{ color: isMe ? 'rgba(150,200,255,0.95)' : 'rgba(255,255,255,0.75)' }}>
                  {player.total_points}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {ranked.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">
          Aún no hay participantes.
        </div>
      )}
    </div>
  )
}
