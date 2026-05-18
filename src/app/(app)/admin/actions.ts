'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSsr } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// ── Admin guard + service-role client ────────────────────────
async function adminClient() {
  const ssr = await createSsr()
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await ssr
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle() as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) throw new Error('No autorizado')

  return {
    svc: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    ),
    userId: user.id,
  }
}

// ── Invitations ───────────────────────────────────────────────

export async function sendInvitation(email: string) {
  const { svc, userId } = await adminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: inviteErr } = await (svc.auth.admin as any).inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
  })
  if (inviteErr) throw new Error(inviteErr.message)

  // Track invitation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (svc.from('invitations') as any).upsert(
    { email: email.toLowerCase(), invited_by: userId },
    { onConflict: 'email', ignoreDuplicates: false },
  )

  revalidatePath('/admin')
}

// ── Scoring ───────────────────────────────────────────────────

export async function setMatchLive(matchId: number) {
  const { svc } = await adminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc.rpc as any)('mark_match_live', { p_match_id: matchId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/matches')
}

export async function scoreGroupMatch(
  matchId:   number,
  scoreHome: number,
  scoreAway: number,
) {
  const { svc } = await adminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc.rpc as any)('score_group_match', {
    p_match_id:   matchId,
    p_score_home: scoreHome,
    p_score_away: scoreAway,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/matches')
}

export async function scoreKnockoutMatch(
  matchId:      number,
  scoreHome:    number,
  scoreAway:    number,
  winnerTeamId: number,
) {
  const { svc } = await adminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc.rpc as any)('score_knockout_match', {
    p_match_id:       matchId,
    p_score_home:     scoreHome,
    p_score_away:     scoreAway,
    p_winner_team_id: winnerTeamId,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/bracket')
}
