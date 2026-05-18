'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActivePoolId } from '@/lib/active-pool'
import { ensureProfile } from '@/lib/ensure-profile'

export async function createPool(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureProfile(supabase, user)

  const name             = (formData.get('name') as string | null)?.trim()
  const description      = (formData.get('description') as string | null)?.trim() || null
  const entryFeeRaw      = parseFloat((formData.get('entry_fee') as string) ?? '0')
  const entry_fee        = isNaN(entryFeeRaw) || entryFeeRaw < 0 ? 0 : entryFeeRaw
  const expectedRaw      = parseInt((formData.get('expected_players') as string) ?? '', 10)
  const expected_players = isNaN(expectedRaw) || expectedRaw < 2 ? null : expectedRaw

  if (!name || name.length < 3) throw new Error('El nombre debe tener al menos 3 caracteres')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pool, error } = await (supabase.from('pools') as any)
    .insert({ name, description, owner_id: user.id, entry_fee, expected_players })
    .select('id')
    .single()

  if (error || !pool) throw new Error(error?.message ?? 'Error al crear la quiniela')

  // Add owner as member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('pool_members') as any)
    .insert({ pool_id: pool.id, user_id: user.id })

  await setActivePoolId(pool.id)
  redirect(`/pools/${pool.id}`)
}
