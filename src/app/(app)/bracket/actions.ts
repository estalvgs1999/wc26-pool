'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getPointsPotential } from '@/lib/scoring/engine'
import { ensureProfile } from '@/lib/ensure-profile'
import type { BracketPick, KnockoutStage } from '@/types'

const TOURNAMENT_START = new Date('2026-06-11T00:00:00Z')

type PickUpsert = Omit<BracketPick, 'id' | 'points_earned' | 'can_edit' | 'created_at' | 'updated_at'>

export async function saveBracketPick(
  teamId:   number,
  stage:    KnockoutStage,
  position: number,
  poolId:   string,
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autenticado')

  await ensureProfile(supabase, user)

  const { data: existing } = await (supabase.from('bracket_picks') as ReturnType<typeof supabase.from>)
    .select('id, version')
    .eq('user_id', user.id)
    .eq('stage', stage)
    .eq('position', position)
    .eq('pool_id', poolId)
    .maybeSingle() as { data: Pick<BracketPick, 'id' | 'version'> | null }

  const isBeforeTournament = new Date() < TOURNAMENT_START
  const isLegacy           = isBeforeTournament || !existing
  const version            = existing ? existing.version + 1 : 1
  const pointsPotential    = getPointsPotential(stage, isLegacy)

  const payload: PickUpsert = {
    user_id:          user.id,
    pool_id:          poolId,
    team_id:          teamId,
    stage,
    position,
    is_legacy:        isLegacy,
    version,
    points_potential: pointsPotential,
  }

  const { error } = await (supabase.from('bracket_picks') as ReturnType<typeof supabase.from>)
    .upsert(payload as never, { onConflict: 'user_id,stage,position,pool_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/bracket')
}
