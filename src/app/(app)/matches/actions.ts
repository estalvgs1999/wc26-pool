'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/ensure-profile'

export async function savePrediction(
  matchId:  number,
  predHome: number,
  predAway: number,
  poolId:   string,
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autenticado')

  await ensureProfile(supabase, user)

  // Enforce group-stage deadline: first match kickoff
  const { data: firstMatch } = await supabase
    .from('matches')
    .select('scheduled_at')
    .eq('stage', 'group')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single() as { data: { scheduled_at: string } | null }

  if (firstMatch && Date.now() >= new Date(firstMatch.scheduled_at).getTime()) {
    throw new Error('El período de predicciones ya cerró')
  }

  const payload = {
    user_id:   user.id,
    pool_id:   poolId,
    match_id:  matchId,
    pred_home: predHome,
    pred_away: predAway,
  }

  const { error } = await (supabase.from('predictions_groups') as ReturnType<typeof supabase.from>)
    .upsert(payload as never, { onConflict: 'user_id,match_id,pool_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/matches')
}
