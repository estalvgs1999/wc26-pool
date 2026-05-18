'use client'

import { useState } from 'react'
import { Copy, Check, Users, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  user_id:   string
  username:  string
  avatar_url: string | null
  points:    number
  joined_at: string
}

interface Props {
  pool: {
    id: string; name: string; description: string | null
    invite_code: string; created_at: string
    entry_fee: number; expected_players: number | null
  }
  leaderboard: LeaderboardEntry[]
  currentUserId: string
  activatePool: () => Promise<void>
}

const PRIZE_SPLIT = [0.5, 0.3, 0.2] as const
const PRIZE_LABELS = ['1er lugar', '2do lugar', '3er lugar'] as const

function fmt(n: number) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PoolDetail({ pool, leaderboard, currentUserId, activatePool }: Props) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pools/join/${pool.invite_code}`

  const actualPot   = pool.entry_fee * leaderboard.length
  const expectedPot = pool.entry_fee * (pool.expected_players ?? leaderboard.length)
  const hasPrize    = pool.entry_fee > 0

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const currentRank = leaderboard.findIndex((e) => e.user_id === currentUserId) + 1

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <Link href="/pools" className="flex items-center gap-1.5 text-white/40 text-sm mb-4 hover:text-white/70 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Mis quinielas
        </Link>
        <h1 className="text-2xl font-bold text-white leading-tight">{pool.name}</h1>
        {pool.description && (
          <p className="text-sm text-white/40 mt-0.5">{pool.description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Participantes</p>
          <p className="text-xl font-bold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-white/30" />
            {leaderboard.length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tu posición</p>
          <p className="text-xl font-bold text-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400/60" />
            {currentRank > 0 ? `#${currentRank}` : '—'}
          </p>
        </div>
      </div>

      {/* Prize pot */}
      {hasPrize && (
        <div className="mx-4 mb-5 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-3">Bote · ${fmt(pool.entry_fee)} por jugador</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-white/30 mb-0.5">Acumulado real</p>
              <p className="text-xl font-bold text-amber-300">${fmt(actualPot)}</p>
              <p className="text-[10px] text-white/25">{leaderboard.length} jugadores</p>
            </div>
            {pool.expected_players && (
              <div>
                <p className="text-[10px] text-white/30 mb-0.5">Bote esperado</p>
                <p className="text-xl font-bold text-white/60">${fmt(expectedPot)}</p>
                <p className="text-[10px] text-white/25">{pool.expected_players} jugadores</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {PRIZE_SPLIT.map((pct, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-xs text-white/50">{PRIZE_LABELS[i]}</span>
                  <span className="text-[10px] text-white/25">({(pct * 100).toFixed(0)}%)</span>
                </div>
                <span className="text-sm font-bold text-white">${fmt(actualPot * pct)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite code */}
      <div className="mx-4 mb-5 bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Código de invitación</p>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-amber-400 tracking-widest flex-1">{pool.invite_code}</p>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-1.5 text-xs text-white/50 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg transition-colors"
          >
            {copied
              ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado</>
              : <><Copy className="w-3.5 h-3.5" /> Copiar link</>
            }
          </button>
        </div>
        <p className="text-[11px] text-white/25 mt-1.5 break-all">{inviteUrl}</p>
      </div>

      {/* Leaderboard */}
      <div className="px-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
          Tabla · {leaderboard.length} jugadores
        </h2>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">
            Nadie ha hecho picks aún.
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => {
              const rank    = idx + 1
              const isMe    = entry.user_id === currentUserId
              const medal   = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border',
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/5 border-white/10',
                  )}
                >
                  <span className="w-6 text-center text-sm font-bold text-white/30 shrink-0">
                    {medal ?? rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold truncate', isMe ? 'text-amber-300' : 'text-white')}>
                      {entry.username}{isMe && <span className="text-amber-500/60 text-xs ml-1">(tú)</span>}
                    </p>
                  </div>
                  <p className={cn('text-sm font-bold shrink-0', isMe ? 'text-amber-400' : 'text-white/60')}>
                    {entry.points} pts
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 inset-x-0 px-4">
        <form action={activatePool}>
          <button
            type="submit"
            className="flex items-center justify-center w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-xl shadow-black/40"
          >
            Hacer picks para esta quiniela
          </button>
        </form>
      </div>
    </div>
  )
}
