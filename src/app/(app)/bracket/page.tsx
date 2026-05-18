import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'
import { calculateGroupStandings, resolveQualifiers } from '@/lib/group-standings'
import { BracketClient } from './BracketClient'
import type { Match, PredictionGroup, Team } from '@/types'

export const dynamic = 'force-dynamic'

export default async function BracketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const poolId = await getActivePoolId()
  if (!poolId) redirect('/pools')

  const [picksRes, teamsRes, poolRes, matchesRes, predsRes] = await Promise.all([
    (supabase.from('bracket_picks') as ReturnType<typeof supabase.from>)
      .select('*, team:teams(*)')
      .eq('user_id', user.id)
      .eq('pool_id', poolId),

    supabase.from('teams').select('*').order('group_id').order('name'),

    (supabase.from('pools') as ReturnType<typeof supabase.from>)
      .select('id, name').eq('id', poolId).maybeSingle(),

    supabase.from('matches').select('*').eq('stage', 'group').order('scheduled_at'),

    (supabase.from('predictions_groups') as ReturnType<typeof supabase.from>)
      .select('match_id, pred_home, pred_away')
      .eq('user_id', user.id)
      .eq('pool_id', poolId),
  ])

  const pool          = poolRes.data as { id: string; name: string } | null
  const teams         = (teamsRes.data ?? []) as Team[]
  const matches       = (matchesRes.data ?? []) as Match[]
  const preds         = (predsRes.data ?? []) as PredictionGroup[]
  const totalMatches  = matches.length
  const filledCount   = preds.length
  const groupsComplete = filledCount >= totalMatches && totalMatches > 0

  const header = (
    <div className="px-4 pt-6 pb-4">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: 'rgba(0,140,255,0.55)' }}>
        FIFA World Cup™
      </p>
      <h1 className="text-2xl font-black text-white tracking-tight">Bracket</h1>
      <p className="text-xs text-white/35 mt-0.5 font-medium">
        Fase Eliminatoria · {pool?.name ?? 'WC26'}
      </p>
    </div>
  )

  // ── Gate: group stage must be fully filled first ──────────────
  if (!groupsComplete) {
    const pct = totalMatches > 0 ? (filledCount / totalMatches) * 100 : 0
    return (
      <div className="flex flex-col min-h-dvh">
        {header}

        <div className="px-4 flex flex-col items-center gap-6 pt-10 pb-16 text-center">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <Lock className="w-8 h-8 text-white/20" />
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-bold text-white/80">Completa la fase de grupos primero</p>
            <p className="text-sm text-white/35 mt-1.5 leading-relaxed max-w-[280px]">
              Necesitas predecir todos los{' '}
              <span className="text-white/60 font-semibold">{totalMatches}</span> partidos de grupos
              antes de armar el bracket eliminatorio.
            </p>
          </div>

          {/* Progress card */}
          <div
            className="w-full rounded-2xl border p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(1,9,21,0.95) 100%)',
              borderColor: 'rgba(255,255,255,0.10)',
            }}
          >
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="text-xs text-white/40">Partidos predichos</span>
              <span className="text-sm font-bold" style={{ color: '#F5A623' }}>
                {filledCount} <span className="text-white/30 font-normal">/ {totalMatches}</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #006847, #F5A623)',
                }}
              />
            </div>
            <p className="text-[11px] text-white/30 mt-2">
              {totalMatches - filledCount} partidos por predecir
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/matches"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(245,166,35,0.15)',
              border: '1px solid rgba(245,166,35,0.30)',
              color: '#F5A623',
            }}
          >
            <CalendarDays className="w-4 h-4" />
            Ir a predecir partidos
          </Link>
        </div>
      </div>
    )
  }

  // ── Full bracket ──────────────────────────────────────────────
  const teamById       = new Map(teams.map(t => [t.id, t]))
  const groupStandings = calculateGroupStandings(matches, preds, teamById)
  const qualifiers     = resolveQualifiers(groupStandings)

  const qualifiersJson = {
    first:     Object.fromEntries(qualifiers.first),
    second:    Object.fromEntries(qualifiers.second),
    thirdBest: qualifiers.thirdBest,
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {header}
      <div className="px-4 pb-4 flex items-center gap-4 -mt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-[11px] font-bold">★</span>
          <span className="text-xs text-white/35">Legacy — pts completos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/30 text-[11px] font-bold">R</span>
          <span className="text-xs text-white/35">Recovery — 40%</span>
        </div>
      </div>

      <BracketClient
        picks={(picksRes.data ?? []) as Parameters<typeof BracketClient>[0]['picks']}
        teams={teams}
        poolId={poolId}
        qualifiers={qualifiersJson}
      />
    </div>
  )
}
