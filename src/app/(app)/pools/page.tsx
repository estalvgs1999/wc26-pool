import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'
import Link from 'next/link'
import { Plus, ChevronRight, Crown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PoolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const activePoolId = await getActivePoolId()

  // Get pools user is a member of (includes pools they own via the member insert on create)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberships } = await (supabase.from('pool_members') as any)
    .select('pool_id, joined_at, pool:pools(id, name, description, owner_id, invite_code, created_at)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false }) as {
      data: Array<{
        pool_id: string
        joined_at: string
        pool: { id: string; name: string; description: string | null; owner_id: string; invite_code: string; created_at: string } | null
      }> | null
    }

  const pools = (memberships ?? [])
    .map((m) => m.pool)
    .filter(Boolean) as NonNullable<typeof memberships>[0]['pool'][]

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <div className="px-4 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis quinielas</h1>
          <p className="text-sm text-white/40 mt-0.5">WC26</p>
        </div>
        <Link
          href="/pools/new"
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </Link>
      </div>

      {/* Join by code */}
      <JoinByCode />

      {/* Pool list */}
      <div className="px-4 mt-2">
        {pools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No estás en ninguna quiniela.<br />Crea una o únete con un código.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pools.map((pool) => {
              if (!pool) return null
              const isActive = pool.id === activePoolId
              const isOwner  = pool.owner_id === user.id

              return (
                <Link
                  key={pool.id}
                  href={`/pools/${pool.id}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all',
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20',
                  )}
                >
                  {isOwner && <Crown className="w-4 h-4 text-amber-500/70 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{pool.name}</p>
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">
                          activa
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/30 font-mono">{pool.invite_code}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function JoinByCode() {
  return (
    <form
      action={async (fd: FormData) => {
        'use server'
        const code = (fd.get('code') as string | null)?.trim().toUpperCase()
        if (code) redirect(`/pools/join/${code}`)
      }}
      className="mx-4 mb-5 flex gap-2"
    >
      <input
        name="code"
        type="text"
        maxLength={8}
        placeholder="Código de invitación"
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm uppercase tracking-widest"
      />
      <button
        type="submit"
        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
      >
        Unirme
      </button>
    </form>
  )
}
