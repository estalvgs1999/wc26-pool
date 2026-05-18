'use client'

import { useState, useMemo } from 'react'
import { DateSelector } from '@/components/ui/DateSelector'
import { MatchCard } from '@/components/game/MatchCard'
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown'
import { savePrediction } from './actions'
import type { Match, PredictionGroup } from '@/types'

interface MatchesClientProps {
  matches:        Match[]
  predictions:    PredictionGroup[]
  flagsByTeamId:  Record<number, string | null>
  poolId:         string
  deadline:       string
}

function getMatchDates(matches: Match[]): Date[] {
  const unique = new Map<string, Date>()
  for (const m of matches) {
    const d   = new Date(m.scheduled_at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!unique.has(key)) unique.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()))
  }
  return Array.from(unique.values()).sort((a, b) => a.getTime() - b.getTime())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth()      === b.getMonth()
    && a.getDate()       === b.getDate()
}

// First date that still has at least one unfilled match
function firstIncompleteDate(dates: Date[], matches: Match[], filledIds: Set<number>): Date {
  return dates.find(date =>
    matches.some(m => isSameDay(new Date(m.scheduled_at), date) && !filledIds.has(m.id))
  ) ?? dates[0] ?? new Date()
}

export function MatchesClient({ matches, predictions, flagsByTeamId, poolId, deadline }: MatchesClientProps) {
  const dates = useMemo(() => getMatchDates(matches), [matches])

  const [predictedIds, setPredictedIds] = useState<Set<number>>(
    () => new Set(predictions.map(p => p.match_id))
  )
  const [isAfterDeadline, setIsAfterDeadline] = useState(
    () => Date.now() >= new Date(deadline).getTime()
  )
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => firstIncompleteDate(dates, matches, new Set(predictions.map(p => p.match_id)))
  )

  // Keep deadline flag in sync
  useMemo(() => {
    const ms = new Date(deadline).getTime() - Date.now()
    if (ms <= 0) return
    const id = setTimeout(() => setIsAfterDeadline(true), ms)
    return () => clearTimeout(id)
  }, [deadline])

  // Per-date fill status for the date strip indicators
  const dateStatus = useMemo(() => {
    const result: Record<string, 'complete' | 'partial' | 'none'> = {}
    for (const date of dates) {
      const dayMatchIds = matches
        .filter(m => isSameDay(new Date(m.scheduled_at), date))
        .map(m => m.id)
      const filled = dayMatchIds.filter(id => predictedIds.has(id)).length
      if (filled === 0)                      result[date.toISOString()] = 'none'
      else if (filled === dayMatchIds.length) result[date.toISOString()] = 'complete'
      else                                   result[date.toISOString()] = 'partial'
    }
    return result
  }, [dates, matches, predictedIds])

  const predictionMap = useMemo(
    () => new Map(predictions.map(p => [p.match_id, p])),
    [predictions],
  )

  const dayMatches = useMemo(
    () => matches.filter(m => isSameDay(new Date(m.scheduled_at), selectedDate)),
    [matches, selectedDate],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of dayMatches) {
      const key = m.group_id ?? m.stage
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(m)
    }
    return map
  }, [dayMatches])

  async function handlePredictionChange(matchId: number, home: number, away: number) {
    await savePrediction(matchId, home, away, poolId)

    // Update local tracking
    const nextIds = new Set(predictedIds)
    nextIds.add(matchId)
    setPredictedIds(nextIds)

    // Auto-advance if this day is now fully filled
    const currentDayIds = matches
      .filter(m => isSameDay(new Date(m.scheduled_at), selectedDate))
      .map(m => m.id)
    const dayComplete = currentDayIds.every(id => nextIds.has(id))

    if (dayComplete) {
      const nextDate = dates.find(d =>
        d > selectedDate &&
        matches.some(m => isSameDay(new Date(m.scheduled_at), d) && !nextIds.has(m.id))
      )
      if (nextDate) setTimeout(() => setSelectedDate(nextDate), 350)
    }
  }

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl">📅</span>
        <p className="text-white/40 text-sm">No hay partidos cargados aún.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      <DeadlineCountdown deadline={deadline} />

      <div className="sticky top-0 z-20 backdrop-blur-xl pt-4 pb-3 border-b border-white/5 mt-4"
        style={{ background: 'rgba(1,9,21,0.92)' }}
      >
        <DateSelector
          dates={dates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          dateStatus={dateStatus}
        />
      </div>

      <div className="px-4 pt-4 pb-2">
        {dayMatches.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">Sin partidos este día.</div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([groupKey, groupMatches]) => (
              <section key={groupKey}>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 px-0.5">
                  {groupKey.length === 1 ? `Grupo ${groupKey}` : groupKey.replace(/_/g, ' ')}
                </h2>
                <div className="space-y-2.5">
                  {groupMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      prediction={predictionMap.get(match.id) ?? null}
                      onPredictionChange={isAfterDeadline ? undefined : handlePredictionChange}
                      isAfterDeadline={isAfterDeadline}
                      homeFlagUrl={match.home_team_id ? flagsByTeamId[match.home_team_id] : null}
                      awayFlagUrl={match.away_team_id ? flagsByTeamId[match.away_team_id] : null}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
