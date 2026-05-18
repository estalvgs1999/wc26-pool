'use server'

import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Guarantees a profile row exists for the given auth user.
 * Safe to call on every server action — upserts are idempotent.
 * Needed when the profiles table is reset without wiping auth.users.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const username =
    (user.user_metadata?.username as string | undefined) ??
    user.email?.split('@')[0] ??
    `user_${user.id.slice(0, 8)}`

  await supabase.from('profiles').upsert(
    { id: user.id, username },
    { onConflict: 'id', ignoreDuplicates: true },
  )
}
