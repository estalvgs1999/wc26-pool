import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActivePoolId } from '@/lib/active-pool'
import { PoolDetail } from './PoolDetail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PoolPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fromPools   = supabase.from('pools')   as ReturnType<typeof supabase.from>
  const fromMembers = supabase.from('pool_members') as ReturnType<typeof supabase.from>
  const fromPreds   = supabase.from('predictions_groups') as ReturnType<typeof supabase.from>
  const fromBracket = supabase.from('bracket_picks') as ReturnType<typeof supabase.from>

  const [poolRes, membersRes] = await Promise.all([
    fromPools
      .select('*')
      .eq('id', id)
      .maybeSingle(),

    fromMembers
      .select('user_id, joined_at, profile:profiles(id, username, avatar_url, total_points)')
      .eq('pool_id', id),
  ])

  const pool = poolRes.data as {
    id: string; name: string; description: string | null;
    owner_id: string; invite_code: string; created_at: string
    entry_fee: number; expected_players: number | null
  } | null

  if (!pool) redirect('/pools')

  const { data: predsPoints } = await fromPreds
    .select('user_id, points_earned')
    .eq('pool_id', id) as { data: { user_id: string; points_earned: number }[] | null }

  const { data: bracketPoints } = await fromBracket
    .select('user_id, points_earned')
    .eq('pool_id', id) as { data: { user_id: string; points_earned: number }[] | null }

  const pointsMap: Record<string, number> = {}
  for (const r of predsPoints ?? [])    pointsMap[r.user_id] = (pointsMap[r.user_id] ?? 0) + r.points_earned
  for (const r of bracketPoints ?? [])  pointsMap[r.user_id] = (pointsMap[r.user_id] ?? 0) + r.points_earned

  type MemberRow = {
    user_id: string
    joined_at: string
    profile: { id: string; username: string; avatar_url: string | null; total_points: number } | null
  }

  const members: MemberRow[] = membersRes.data ?? []
  const leaderboard = members
    .map((m) => ({
      user_id:   m.user_id,
      username:  m.profile?.username ?? '—',
      avatar_url: m.profile?.avatar_url ?? null,
      points:    pointsMap[m.user_id] ?? 0,
      joined_at: m.joined_at,
    }))
    .sort((a, b) => b.points - a.points)

  async function activatePool() {
    'use server'
    await setActivePoolId(id)
    redirect('/matches')
  }

  return (
    <PoolDetail
      pool={pool}
      leaderboard={leaderboard}
      currentUserId={user.id}
      activatePool={activatePool}
    />
  )
}
