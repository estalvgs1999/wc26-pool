import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getActivePoolId } from '@/lib/active-pool'

export async function PoolBar() {
  const poolId = await getActivePoolId()

  if (!poolId) {
    return (
      <div className="px-4 pt-3 pb-0">
        <Link
          href="/pools"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/8 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <span className="text-xs opacity-40">🏆</span>
          </div>
          <p className="text-xs text-white/25 flex-1 font-medium">Sin quiniela activa</p>
          <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
        </Link>
      </div>
    )
  }

  const supabase = await createClient()
  const { data } = await (supabase.from('pools') as ReturnType<typeof supabase.from>)
    .select('name')
    .eq('id', poolId)
    .maybeSingle()

  const name = (data as { name: string } | null)?.name ?? 'Quiniela'

  return (
    <div className="px-4 pt-3 pb-0">
      <Link
        href="/pools"
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, rgba(0,85,184,0.14) 0%, rgba(0,50,140,0.07) 100%)',
          borderColor: 'rgba(0,120,255,0.22)',
          boxShadow: 'inset 0 1px 0 rgba(100,170,255,0.10)',
        }}
      >
        {/* FIFA blue accent dot */}
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(145deg, rgba(0,85,184,0.60) 0%, rgba(0,50,140,0.70) 100%)',
            border: '1px solid rgba(0,120,255,0.30)',
          }}>
          <span className="text-xs leading-none">🏆</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/90 truncate">{name}</p>
        </div>

        <span
          className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(0,85,184,0.25)',
            border: '1px solid rgba(0,120,255,0.30)',
            color: 'rgba(100,170,255,0.90)',
          }}
        >
          activa
        </span>
      </Link>
    </div>
  )
}
