import { redirect } from 'next/navigation'
import { createClient as createSsr } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { AdminDashboard } from './AdminDashboard'
import type { Match } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const ssr = await createSsr()
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await ssr
    .from('profiles').select('is_admin').eq('id', user.id).maybeSingle() as
    { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) redirect('/dashboard')

  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminApi      = svc.auth.admin  as any
  const fromInvites   = svc.from('invitations')   as ReturnType<typeof svc.from>
  const fromMembers   = svc.from('pool_members')   as ReturnType<typeof svc.from>

  const [matchesRes, usersRes, invitationsRes, membersRes] = await Promise.all([
    ssr.from('matches').select('*').order('scheduled_at', { ascending: true }),
    adminApi.listUsers({ perPage: 1 }),
    fromInvites.select('*').order('created_at', { ascending: false }),
    fromMembers.select('pool_id, pool:pools(id, name, owner_id, invite_code, created_at, owner_profile:profiles!pools_owner_id_fkey(username))'),
  ])

  const userCount = (usersRes.data as { total?: number } | null)?.total ?? 0

  // Aggregate pool member counts from raw memberships
  type OwnerProfile = { username: string }
  type PoolInfo = { id: string; name: string; owner_id: string; invite_code: string; created_at: string; owner_profile: OwnerProfile | OwnerProfile[] | null }
  type MemberRow = { pool_id: string; pool: PoolInfo | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMembers: MemberRow[] = (membersRes.data as any[])?.map((r: any) => ({
    pool_id: r.pool_id,
    pool: Array.isArray(r.pool) ? r.pool[0] ?? null : r.pool,
  })) ?? []
  const poolMap = new Map<string, { count: number; pool: NonNullable<MemberRow['pool']> }>()

  for (const row of rawMembers) {
    if (!row.pool) continue
    const entry = poolMap.get(row.pool_id)
    if (entry) { entry.count++ }
    else       { poolMap.set(row.pool_id, { count: 1, pool: row.pool }) }
  }

  const pools = Array.from(poolMap.values())
    .map(({ count, pool }) => ({
      id:             pool.id,
      name:           pool.name,
      owner_id:       pool.owner_id,
      invite_code:    pool.invite_code,
      created_at:     pool.created_at,
      member_count:   count,
      owner_username: (Array.isArray(pool.owner_profile) ? pool.owner_profile[0] : pool.owner_profile)?.username ?? '—',
    }))
    .sort((a, b) => b.member_count - a.member_count)

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-4 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm text-white/40 mt-0.5">Panel de administración · WC26</p>
      </div>

      <AdminDashboard
        matches={(matchesRes.data ?? []) as Match[]}
        userCount={userCount}
        invitations={invitationsRes.data ?? []}
        pools={pools}
      />
    </div>
  )
}
