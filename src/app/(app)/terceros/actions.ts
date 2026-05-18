'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveThirdPlacePicks(groups: string[]) {
  if (groups.length > 8) throw new Error('Máximo 8 terceros')

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autenticado')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('save_third_place_picks', {
    p_user_id: user.id,
    p_groups:  groups,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/terceros')
}
