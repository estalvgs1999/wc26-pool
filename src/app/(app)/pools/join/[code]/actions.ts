'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActivePoolId } from '@/lib/active-pool'
import { ensureProfile } from '@/lib/ensure-profile'

export async function joinPool(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureProfile(supabase, user)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pool, error } = await (supabase.from('pools') as any)
    .select('id, name, owner_id')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle()

  if (error || !pool) throw new Error('Código de invitación inválido')

  // Already a member?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('pool_members') as any)
    .select('id')
    .eq('pool_id', pool.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: joinErr } = await (supabase.from('pool_members') as any)
      .insert({ pool_id: pool.id, user_id: user.id })
    if (joinErr) throw new Error('No se pudo unir a la quiniela')
  }

  await setActivePoolId(pool.id)
  redirect(`/pools/${pool.id}`)
}
