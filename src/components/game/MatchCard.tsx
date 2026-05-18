'use client'

import { useState, useCallback } from 'react'
import { Clock, Lock, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlagImg } from '@/components/ui/FlagImg'
import type { Match, PredictionGroup } from '@/types'

interface MatchCardProps {
  match: Match
  prediction: PredictionGroup | null
  onPredictionChange?: (matchId: number, home: number, away: number) => Promise<void>
  isAfterDeadline?: boolean
  className?: string
  homeFlagUrl?: string | null
  awayFlagUrl?: string | null
}

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number | ''
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={20}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10)
        if (!isNaN(n) && n >= 0 && n <= 20) onChange(n)
      }}
      className={cn(
        'w-10 h-10 rounded-xl text-center text-lg font-bold',
        'bg-white/10 border border-white/10',
        'text-white placeholder-white/20',
        'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30',
        'transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
      )}
      placeholder="–"
    />
  )
}


function formatKickoff(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  })
}

const POINTS_IN_PLAY = { scheduled: 5, live: 5, finished: 0 }

export function MatchCard({
  match,
  prediction,
  onPredictionChange,
  isAfterDeadline = false,
  className,
  homeFlagUrl,
  awayFlagUrl,
}: MatchCardProps) {
  const [home, setHome] = useState<number | ''>(prediction?.pred_home ?? '')
  const [away, setAway] = useState<number | ''>(prediction?.pred_away ?? '')
  const [saving, setSaving] = useState(false)

  const isLocked    = match.status !== 'scheduled' || isAfterDeadline
  const isFinished  = match.status === 'finished'
  const hasResult   = match.score_home != null && match.score_away != null
  const pointsEarned = prediction?.points_earned ?? 0

  const handleBlur = useCallback(async () => {
    if (
      !onPredictionChange ||
      home === '' ||
      away === '' ||
      isLocked
    ) return

    setSaving(true)
    try {
      await onPredictionChange(match.id, home as number, away as number)
    } finally {
      setSaving(false)
    }
  }, [home, away, isLocked, match.id, onPredictionChange])

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden border transition-all duration-200',
        isFinished && pointsEarned > 0 ? 'border-amber-500/30' : 'border-white/10',
        className,
      )}
      style={{
        background: isFinished && pointsEarned > 0
          ? 'linear-gradient(135deg, rgba(245,166,35,0.07) 0%, rgba(1,9,21,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(0,85,184,0.07) 0%, rgba(1,9,21,0.95) 100%)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Live pulse bar */}
      {match.status === 'live' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
      )}

      <div className="px-4 pt-3 pb-4">
        {/* Header: time / status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {match.status === 'live' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">En Vivo</span>
              </>
            ) : isFinished ? (
              <span className="text-xs text-white/40 uppercase tracking-wider">Final</span>
            ) : (
              <>
                <Clock className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/40">{formatKickoff(match.scheduled_at)}</span>
              </>
            )}
          </div>

          {/* Points badge */}
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold',
            isFinished && pointsEarned > 0
              ? 'text-amber-300'
              : isFinished
              ? 'bg-white/5 text-white/20'
              : 'text-white/40',
          )}
          style={isFinished && pointsEarned > 0
            ? { background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.25)' }
            : !isFinished
            ? { background: 'rgba(0,85,184,0.15)', border: '1px solid rgba(0,120,255,0.22)' }
            : {}
          }>
            {isFinished ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>{pointsEarned} pts</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                <span>hasta {POINTS_IN_PLAY.scheduled} pts</span>
              </>
            )}
          </div>
        </div>

        {/* Teams + Score row */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <FlagImg url={homeFlagUrl} name={match.home_team} className="w-10 h-7 rounded" />
            <span className="text-xs font-medium text-white/80 truncate max-w-[72px] text-center">
              {match.home_team}
            </span>
          </div>

          {/* Score / Inputs */}
          <div className="flex items-center gap-2">
            {/* Prediction inputs or actual score */}
            {isFinished && hasResult ? (
              <div className="flex items-center gap-1.5">
                {/* Actual result (small, above) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Pred.</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold',
                      'bg-white/5 border border-white/10',
                      prediction?.pred_home === match.score_home ? 'text-amber-300' : 'text-white/50',
                    )}>
                      {prediction?.pred_home ?? '–'}
                    </span>
                    <span className="text-white/20 text-sm">:</span>
                    <span className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold',
                      'bg-white/5 border border-white/10',
                      prediction?.pred_away === match.score_away ? 'text-amber-300' : 'text-white/50',
                    )}>
                      {prediction?.pred_away ?? '–'}
                    </span>
                  </div>
                </div>

                <div className="w-px h-10 bg-white/10 mx-1" />

                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Result.</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-white/10 border border-white/15 text-white">
                      {match.score_home}
                    </span>
                    <span className="text-white/40 text-sm">:</span>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-white/10 border border-white/15 text-white">
                      {match.score_away}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) handleBlur()
                }}
              >
                <ScoreInput value={home} onChange={setHome} disabled={isLocked} />
                <span className="text-white/30 text-lg font-light">:</span>
                <ScoreInput value={away} onChange={setAway} disabled={isLocked} />

                {isLocked && (
                  <div className="absolute -top-1 -right-1">
                    <Lock className="w-3 h-3 text-white/20" />
                  </div>
                )}

                {saving && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <FlagImg url={awayFlagUrl} name={match.away_team} className="w-10 h-7 rounded" />
            <span className="text-xs font-medium text-white/80 truncate max-w-[72px] text-center">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Venue */}
        {match.venue && (
          <p className="mt-2 text-[10px] text-white/25 text-center truncate">{match.venue}</p>
        )}
      </div>
    </div>
  )
}
