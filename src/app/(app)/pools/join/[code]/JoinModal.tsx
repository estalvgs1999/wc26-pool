'use client'

import { useRouter } from 'next/navigation'
import { Trophy, Users, X } from 'lucide-react'

interface Pool {
  id: string
  name: string
  description: string | null
  invite_code: string
  entry_fee: number
  expected_players: number | null
}

interface Props {
  pool: Pool
  onJoin: () => Promise<void>
}

export function JoinModal({ pool, onJoin }: Props) {
  const router = useRouter()

  function handleReject() {
    router.push('/pools')
  }

  const hasPrize = pool.entry_fee > 0

  return (
    /* Full-page backdrop */
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      {/* Modal card */}
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <button
              onClick={handleReject}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors shrink-0 ml-auto"
              aria-label="Rechazar"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="mt-3">
            <p className="text-xs text-white/40 mb-1">Invitación a quiniela</p>
            <h2 className="text-xl font-bold text-white leading-tight">{pool.name}</h2>
            {pool.description && (
              <p className="text-sm text-white/40 mt-1">{pool.description}</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold font-mono text-amber-400">
                {pool.invite_code.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Código</p>
              <p className="text-sm font-bold text-amber-400 tracking-widest font-mono">
                {pool.invite_code}
              </p>
            </div>
          </div>

          {hasPrize && (
            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-amber-400/60 uppercase tracking-widest mb-0.5">
                  Inscripción
                </p>
                <p className="text-lg font-bold text-amber-300">
                  ${pool.entry_fee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {pool.expected_players && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">
                    Bote esperado
                  </p>
                  <p className="text-sm font-semibold text-white/60">
                    ${(pool.entry_fee * pool.expected_players).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasPrize && (
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
              <Users className="w-4 h-4 text-white/30" />
              <p className="text-sm text-white/50">Quiniela sin inscripción</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <form action={onJoin}>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-sm transition-all"
            >
              Unirme a la quiniela
            </button>
          </form>
          <button
            onClick={handleReject}
            className="w-full py-3 rounded-xl text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}
