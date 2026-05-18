import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThirdPlaceClient } from './ThirdPlaceClient'
import type { Team, ThirdPlacePick } from '@/types'

export const dynamic = 'force-dynamic'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default async function TercerosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [teamsRes, picksRes] = await Promise.all([
    supabase
      .from('teams')
      .select('*')
      .order('group_id', { ascending: true })
      .order('name',     { ascending: true }),

    supabase
      .from('third_place_picks')
      .select('*')
      .eq('user_id', user.id),
  ])

  const teams  = (teamsRes.data ?? []) as Team[]
  const picks  = (picksRes.data ?? []) as ThirdPlacePick[]

  // Build GroupInfo: teams ordered as in bracket (slot 3 = the third-place position)
  const groups = ALL_GROUPS.map((gId) => ({
    id:    gId,
    teams: teams.filter((t) => t.group_id === gId),
  }))

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Mejores Terceros</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Elige los 8 grupos cuyo 3.º clasificado avanzará al R32
        </p>
      </div>

      <ThirdPlaceClient groups={groups} initialPicks={picks} />
    </div>
  )
}
