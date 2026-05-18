import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { joinPool } from './actions'
import { JoinModal } from './JoinModal'

interface Props {
  params: Promise<{ code: string }>
}

export default async function JoinPoolPage({ params }: Props) {
  const { code } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/pools/join/${code}`)

  const upperCode = code.toUpperCase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pool } = await (supabase.from('pools') as any)
    .select('id, name, description, entry_fee, expected_players')
    .eq('invite_code', upperCode)
    .maybeSingle() as {
      data: {
        id: string; name: string; description: string | null
        entry_fee: number; expected_players: number | null
      } | null
    }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-6 text-center">
        <p className="text-5xl">❌</p>
        <p className="text-white font-semibold text-lg">Código inválido</p>
        <p className="text-white/40 text-sm">Este código de invitación no existe o ya expiró.</p>
        <a href="/pools" className="text-amber-400 text-sm mt-2 hover:text-amber-300 transition-colors">
          Ver mis quinielas
        </a>
      </div>
    )
  }

  // Check if already a member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('pool_members') as any)
    .select('id')
    .eq('pool_id', pool.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    redirect(`/pools/${pool.id}`)
  }

  async function handleJoin() {
    'use server'
    await joinPool(upperCode)
  }

  return (
    <JoinModal
      pool={{ ...pool, invite_code: upperCode }}
      onJoin={handleJoin}
    />
  )
}
