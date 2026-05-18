'use server'

import { createClient } from '@/lib/supabase/server'

export async function markOnboardingDone() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ onboarding_done: true } as never).eq('id', user.id)
}
