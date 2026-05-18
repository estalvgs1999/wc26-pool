'use client'

import { useState } from 'react'
import { BracketView, type BracketPickWithTeam } from '@/components/game/BracketView'
import { saveBracketPick } from './actions'
import type { KnockoutStage, Team } from '@/types'
import type { BracketMatchDef } from '@/lib/bracket-structure'
import type { QualifiersJson } from '@/components/game/BracketView'

interface BracketClientProps {
  picks:      BracketPickWithTeam[]
  teams:      Team[]
  poolId:     string
  qualifiers: QualifiersJson
}

export function BracketClient({ picks, teams, poolId, qualifiers }: BracketClientProps) {
  const [selectedStage, setSelectedStage] = useState<KnockoutStage>('round_of_32')
  const [localPicks, setLocalPicks]       = useState<BracketPickWithTeam[]>(picks)
  const [saving, setSaving]               = useState(false)

  async function handlePickTeam(match: BracketMatchDef, team: Team) {
    if (saving) return
    setSaving(true)

    try {
      await saveBracketPick(team.id, match.stage, match.position, poolId)

      setLocalPicks((prev) => {
        const now      = new Date().toISOString()
        const idx      = prev.findIndex(p => p.stage === match.stage && p.position === match.position)
        const existing = idx >= 0 ? prev[idx] : null

        const next: BracketPickWithTeam = {
          id:               existing?.id ?? crypto.randomUUID(),
          user_id:          '',
          pool_id:          poolId,
          team_id:          team.id,
          team,
          stage:            match.stage,
          position:         match.position,
          is_legacy:        existing ? existing.is_legacy : true,
          can_edit:         true,
          version:          existing ? existing.version + 1 : 1,
          points_potential: 0,
          points_earned:    existing?.points_earned ?? 0,
          created_at:       existing?.created_at ?? now,
          updated_at:       now,
        }

        let updated = idx >= 0
          ? [...prev.slice(0, idx), next, ...prev.slice(idx + 1)]
          : [...prev, next]

        // Clear downstream picks that relied on the OLD team
        if (existing && existing.team_id !== team.id) {
          updated = cascadeClear(updated, match.stage, match.position, existing.team_id)
        }

        return updated
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {saving && (
        <div className="fixed top-4 right-4 z-50 glass px-3 py-2 flex items-center gap-2 rounded-xl">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-white/60">Guardando…</span>
        </div>
      )}

      <BracketView
        picks={localPicks}
        allTeams={teams}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        onPickTeam={handlePickTeam}
        canEdit={!saving}
        qualifiers={qualifiers}
      />
    </>
  )
}

function cascadeClear(
  picks:        BracketPickWithTeam[],
  changedStage: KnockoutStage,
  changedPos:   number,
  oldTeamId:    number,
): BracketPickWithTeam[] {
  const NEXT_STAGE: Partial<Record<KnockoutStage, KnockoutStage>> = {
    round_of_32:   'round_of_16',
    round_of_16:   'quarter_final',
    quarter_final: 'semi_final',
    semi_final:    'final',
  }
  const nextStage = NEXT_STAGE[changedStage]
  if (!nextStage) return picks

  const nextPos       = Math.ceil(changedPos / 2)
  const downstreamIdx = picks.findIndex(p => p.stage === nextStage && p.position === nextPos)
  if (downstreamIdx < 0) return picks

  const downstream = picks[downstreamIdx]
  if (downstream.team_id !== oldTeamId) return picks

  const updated = [...picks.slice(0, downstreamIdx), ...picks.slice(downstreamIdx + 1)]
  return cascadeClear(updated, nextStage, nextPos, oldTeamId)
}
