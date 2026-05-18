'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import { FlagImg } from '@/components/ui/FlagImg'
import {
  BRACKET_MATCHES,
  KNOCKOUT_STAGE_ORDER,
  STAGE_LABELS_ES,
  STAGE_SHORT_ES,
  STAGE_POINTS,
  PREV_STAGE,
  type BracketMatchDef,
} from '@/lib/bracket-structure'
import { resolveSlotCandidates } from '@/lib/group-standings'
import type { BracketPick, KnockoutStage, Team } from '@/types'

export type BracketPickWithTeam = BracketPick & { team: Team | null }

export interface QualifiersJson {
  first:     Record<string, Team>
  second:    Record<string, Team>
  thirdBest: Team[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pickKey(stage: KnockoutStage, position: number) {
  return `${stage}:${position}`
}

function resolvePrevPicks(
  match:   BracketMatchDef,
  pickMap: Map<string, BracketPickWithTeam>,
): [BracketPickWithTeam | null, BracketPickWithTeam | null] {
  if (!match.feedsFrom) return [null, null]
  const prev = PREV_STAGE[match.stage]!
  return [
    pickMap.get(pickKey(prev, match.feedsFrom[0])) ?? null,
    pickMap.get(pickKey(prev, match.feedsFrom[1])) ?? null,
  ]
}

// ── TeamButton ────────────────────────────────────────────────────────────────

interface TeamButtonProps {
  team:      Team | null
  slotLabel: string
  isWinner:  boolean
  onClick:   (() => void) | null
}

function TeamButton({ team, slotLabel, isWinner, onClick }: TeamButtonProps) {
  if (!team) {
    return (
      <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[76px] opacity-25 cursor-default border border-white/10"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="w-10 h-7 rounded border border-dashed border-white/20 flex items-center justify-center">
          <span className="text-[9px] text-white/40 font-bold">?</span>
        </div>
        <span className="text-[8px] text-white/30 uppercase tracking-widest">{slotLabel}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick ?? undefined}
      disabled={!onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[76px] border transition-all duration-200',
        isWinner
          ? 'border-amber-500/50'
          : onClick
          ? 'border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.96]'
          : 'border-white/5 opacity-50 cursor-default',
      )}
      style={isWinner
        ? { background: 'rgba(245,166,35,0.13)' }
        : { background: 'rgba(255,255,255,0.04)' }
      }
    >
      <div className="relative">
        <div className={cn('w-10 h-7 rounded overflow-hidden', isWinner && 'ring-2 ring-amber-400/40')}>
          <FlagImg url={team.flag_url} name={team.name} className="w-full h-full" />
        </div>
        {isWinner && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
            <CheckCircle2 className="w-2.5 h-2.5 text-black" />
          </div>
        )}
      </div>
      <span className={cn(
        'text-[11px] font-bold leading-tight',
        isWinner ? 'text-amber-300' : 'text-white/60',
      )}>
        {team.code}
      </span>
      <span className="text-[8px] text-white/20 uppercase tracking-widest">{slotLabel}</span>
    </button>
  )
}

// ── CandidateGrid — for 3rd-place slots with multiple options ─────────────────

interface CandidateGridProps {
  candidates: Team[]
  slotLabel:  string
  selectedId: number | null
  canPick:    boolean
  onPick:     (team: Team) => void
}

function CandidateGrid({ candidates, slotLabel, selectedId, canPick, onPick }: CandidateGridProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <div className="w-3 h-px bg-white/10" />
        <span className="text-[8px] text-white/25 uppercase tracking-widest whitespace-nowrap">{slotLabel}</span>
        <div className="w-3 h-px bg-white/10" />
      </div>

      {candidates.length === 0 ? (
        <div className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-white/5 w-full"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="text-[9px] text-white/20 text-center leading-tight">
            Predice los grupos para ver candidatos
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {candidates.map(team => {
            const isSelected = selectedId === team.id
            return (
              <button
                key={team.id}
                onClick={canPick ? () => onPick(team) : undefined}
                disabled={!canPick}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-all duration-150',
                  isSelected
                    ? 'border-amber-500/50'
                    : canPick
                    ? 'border-white/10 hover:border-white/25 active:scale-[0.94]'
                    : 'border-white/5 opacity-50',
                )}
                style={isSelected
                  ? { background: 'rgba(245,166,35,0.14)' }
                  : { background: 'rgba(255,255,255,0.04)' }
                }
              >
                <div className={cn(
                  'w-9 h-6 rounded overflow-hidden',
                  isSelected && 'ring-1 ring-amber-400/50',
                )}>
                  <FlagImg url={team.flag_url} name={team.name} className="w-full h-full" />
                </div>
                <span className={cn(
                  'text-[9px] font-bold leading-none',
                  isSelected ? 'text-amber-300' : 'text-white/40',
                )}>
                  {team.code}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── BracketMatchCard ──────────────────────────────────────────────────────────

interface BracketMatchCardProps {
  match:      BracketMatchDef
  pickMap:    Map<string, BracketPickWithTeam>
  allTeams:   Team[]
  qualifiers: QualifiersJson
  onPick:     (match: BracketMatchDef, team: Team) => void
  canEdit:    boolean
}

function BracketMatchCard({ match, pickMap, allTeams, qualifiers, onPick, canEdit }: BracketMatchCardProps) {
  const currentPick = pickMap.get(pickKey(match.stage, match.position)) ?? null
  const pts         = STAGE_POINTS[match.stage]
  const isLegacy    = currentPick?.is_legacy ?? true

  let team1:           Team | null = null
  let team2:           Team | null = null
  let slot1Label                   = ''
  let slot2Label                   = ''
  let locked                       = false
  let slot2Candidates: Team[]      = []
  let useThirdPlaceGrid            = false

  if (match.stage === 'round_of_32') {
    slot1Label = match.slot1!.label
    slot2Label = match.slot2!.label

    const q = {
      first:     new Map(Object.entries(qualifiers.first)),
      second:    new Map(Object.entries(qualifiers.second)),
      thirdBest: qualifiers.thirdBest,
    }

    const c1 = resolveSlotCandidates(slot1Label, match.slot1!.groups, q)
    const c2 = resolveSlotCandidates(slot2Label, match.slot2!.groups, q)

    team1 = c1[0] ?? null

    if (slot2Label.startsWith('3ro')) {
      slot2Candidates  = c2
      useThirdPlaceGrid = c2.length !== 1
      team2             = c2.length === 1 ? c2[0] : null
    } else {
      team2 = c2[0] ?? null
    }

  } else {
    const [prev1, prev2] = resolvePrevPicks(match, pickMap)
    team1      = prev1?.team ?? null
    team2      = prev2?.team ?? null
    slot1Label = `M${match.feedsFrom![0]}`
    slot2Label = `M${match.feedsFrom![1]}`
    locked     = !prev1 || !prev2
  }

  const canPick = canEdit && !locked

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        locked
          ? 'border-white/5 opacity-40'
          : currentPick
          ? 'border-amber-500/25'
          : 'border-white/10',
      )}
      style={{
        background: currentPick
          ? 'linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(1,9,21,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(1,9,21,0.95) 100%)',
      }}
    >
      <div className="px-3 pt-3 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
            Partido {match.position}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={currentPick && isLegacy
              ? { background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.25)' }
            }
          >
            {currentPick
              ? `${isLegacy ? pts.legacy : pts.recovery} pts${isLegacy ? ' ★' : ' R'}`
              : `hasta ${pts.legacy} pts`
            }
          </span>
        </div>

        {/* Content */}
        {locked ? (
          <p className="text-[11px] text-white/25 text-center py-3">
            Completa la ronda anterior · M{match.feedsFrom![0]} y M{match.feedsFrom![1]}
          </p>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Slot 1 — always a single known team */}
            <div className="shrink-0">
              <TeamButton
                team={team1}
                slotLabel={slot1Label}
                isWinner={!!currentPick && currentPick.team_id === team1?.id}
                onClick={canPick && team1 ? () => onPick(match, team1!) : null}
              />
            </div>

            <span className="text-white/15 text-xs font-light shrink-0">vs</span>

            {/* Slot 2 — single team or 3rd-place candidate grid */}
            {useThirdPlaceGrid ? (
              <CandidateGrid
                candidates={slot2Candidates}
                slotLabel={slot2Label}
                selectedId={currentPick?.team_id ?? null}
                canPick={canPick}
                onPick={(team) => onPick(match, team)}
              />
            ) : (
              <div className="shrink-0">
                <TeamButton
                  team={team2}
                  slotLabel={slot2Label}
                  isWinner={!!currentPick && currentPick.team_id === team2?.id}
                  onClick={canPick && team2 ? () => onPick(match, team2!) : null}
                />
              </div>
            )}
          </div>
        )}

        {/* Hint: no group predictions filled yet */}
        {!locked && !team1 && !useThirdPlaceGrid && !team2 && (
          <p className="text-[10px] text-white/20 text-center pt-1">
            Llena la fase de grupos para ver los equipos
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main BracketView ──────────────────────────────────────────────────────────

interface BracketViewProps {
  picks:         BracketPickWithTeam[]
  allTeams:      Team[]
  selectedStage: KnockoutStage
  onStageChange: (stage: KnockoutStage) => void
  onPickTeam:    (match: BracketMatchDef, team: Team) => void
  canEdit:       boolean
  qualifiers:    QualifiersJson
  className?:    string
}

export function BracketView({
  picks,
  allTeams,
  selectedStage,
  onStageChange,
  onPickTeam,
  canEdit,
  qualifiers,
  className,
}: BracketViewProps) {
  const pickMap      = new Map(picks.map(p => [pickKey(p.stage, p.position), p]))
  const stageMatches = BRACKET_MATCHES.filter(m => m.stage === selectedStage)

  function picksInStage(stage: KnockoutStage) {
    return picks.filter(p => p.stage === stage).length
  }
  function totalInStage(stage: KnockoutStage) {
    return BRACKET_MATCHES.filter(m => m.stage === stage).length
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Round tabs */}
      <div className="overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 min-w-max">
          {KNOCKOUT_STAGE_ORDER.map((stage) => {
            const done   = picksInStage(stage)
            const total  = totalInStage(stage)
            const active = stage === selectedStage
            return (
              <button
                key={stage}
                onClick={() => onStageChange(stage)}
                className={cn(
                  'flex flex-col items-center px-3.5 py-2 rounded-xl border shrink-0 transition-all duration-200',
                  active ? 'text-white' : 'text-white/35 hover:text-white/60',
                )}
                style={active
                  ? { background: 'rgba(245,166,35,0.10)', borderColor: 'rgba(245,166,35,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }
                }
              >
                <span className="text-[11px] font-bold">{STAGE_SHORT_ES[stage]}</span>
                <span className={cn(
                  'text-[9px] mt-0.5',
                  done === total && total > 0 ? 'text-amber-400' : active ? 'text-white/50' : 'text-white/25',
                )}>
                  {done}/{total}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stage header */}
      <div className="px-4 mb-3">
        <h2 className="text-base font-bold text-white">{STAGE_LABELS_ES[selectedStage]}</h2>
        <p className="text-xs text-white/30 mt-0.5">
          {selectedStage === 'round_of_32'
            ? 'Toca el equipo que crees que avanza · equipos 3ros elegibles en cada partido'
            : 'Toca el equipo que crees que avanza'
          } · {STAGE_POINTS[selectedStage].legacy} pts
        </p>
      </div>

      {/* Match list */}
      <div className="px-4 space-y-3 pb-6">
        {stageMatches.map(match => (
          <BracketMatchCard
            key={match.id}
            match={match}
            pickMap={pickMap}
            allTeams={allTeams}
            qualifiers={qualifiers}
            onPick={onPickTeam}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  )
}
