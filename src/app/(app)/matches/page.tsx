import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'
import { MatchesClient } from './MatchesClient'

export const dynamic = 'force-dynamic'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const poolId = await getActivePoolId()
  if (!poolId) redirect('/pools')

  const [matchesRes, predsRes, teamsRes, poolRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*')
      .eq('stage', 'group')
      .order('scheduled_at', { ascending: true }),

    (supabase.from('predictions_groups') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('user_id', user.id)
      .eq('pool_id', poolId),

    supabase
      .from('teams')
      .select('id, flag_url'),

    (supabase.from('pools') as ReturnType<typeof supabase.from>)
      .select('id, name')
      .eq('id', poolId)
      .maybeSingle(),
  ])

  type TeamFlag = { id: number; flag_url: string | null }
  const flagsByTeamId = Object.fromEntries(
    ((teamsRes.data ?? []) as TeamFlag[]).map((t) => [t.id, t.flag_url]),
  )

  const pool = poolRes.data as { id: string; name: string } | null

  // Deadline = kickoff of the first group match
  const allMatches = (matchesRes.data ?? []) as import('@/types').Match[]
  const firstMatch = allMatches[0]
  const deadline   = firstMatch?.scheduled_at ?? new Date(Date.now() + 365 * 86400_000).toISOString()

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-4 pt-6 pb-4">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: 'rgba(0,140,255,0.55)' }}>
          FIFA World Cup™
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">Partidos</h1>
        <p className="text-xs text-white/35 mt-0.5 font-medium">
          Fase de Grupos · {pool?.name ?? 'WC26'}
        </p>
      </div>

      <MatchesClient
        matches={allMatches}
        predictions={predsRes.data ?? []}
        flagsByTeamId={flagsByTeamId}
        poolId={poolId}
        deadline={deadline}
      />
    </div>
  )
}
