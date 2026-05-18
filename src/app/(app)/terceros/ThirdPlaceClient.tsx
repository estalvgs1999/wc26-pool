'use client'

import { useState, useTransition } from 'react'
import { Check, GripVertical, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveThirdPlacePicks } from './actions'
import type { Team, ThirdPlacePick } from '@/types'

interface GroupInfo {
  id: string
  teams: Team[]
}

interface ThirdPlaceClientProps {
  groups:        GroupInfo[]
  initialPicks:  ThirdPlacePick[]
}

const MAX_PICKS = 8

export function ThirdPlaceClient({ groups, initialPicks }: ThirdPlaceClientProps) {
  const [selected, setSelected] = useState<string[]>(
    initialPicks
      .sort((a, b) => a.slot_rank - b.slot_rank)
      .map((p) => p.group_id),
  )
  const [saving, startSave]  = useTransition()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function toggle(groupId: string) {
    setSelected((prev) => {
      if (prev.includes(groupId)) return prev.filter((g) => g !== groupId)
      if (prev.length >= MAX_PICKS) return prev  // silently cap
      return [...prev, groupId]
    })
  }

  function remove(groupId: string) {
    setSelected((prev) => prev.filter((g) => g !== groupId))
  }

  function handleSave() {
    startSave(async () => {
      await saveThirdPlacePicks(selected)
      setSavedAt(Date.now())
    })
  }

  const isDirty = selected.join(',') !== initialPicks
    .sort((a, b) => a.slot_rank - b.slot_rank)
    .map((p) => p.group_id)
    .join(',')

  return (
    <div className="flex flex-col gap-6 px-4 pb-8">

      {/* Instructions */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm text-white/60 leading-relaxed">
          Elige los <span className="text-white font-semibold">8 grupos</span> cuyo tercer lugar
          crees que avanzará al R32. El sistema los asignará a su slot de bracket según la
          tabla oficial de la FIFA al finalizar la fase de grupos.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className={cn(
            'text-xs px-2 py-0.5 rounded-full font-semibold',
            selected.length === MAX_PICKS
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/10 text-white/50',
          )}>
            {selected.length} / {MAX_PICKS} seleccionados
          </div>
        </div>
      </div>

      {/* Selected picks summary */}
      {selected.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Tu selección (en orden)</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((gId, idx) => (
              <div
                key={gId}
                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30
                           rounded-full px-2.5 py-1"
              >
                <GripVertical className="w-3 h-3 text-amber-500/50" />
                <span className="text-xs text-amber-400 font-semibold">{idx + 1}</span>
                <span className="text-xs text-white font-medium">Grupo {gId}</span>
                <button
                  onClick={() => remove(gId)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group grid */}
      <div className="grid grid-cols-2 gap-3">
        {groups.map((group) => {
          const rank = selected.indexOf(group.id)
          const isSelected = rank >= 0

          return (
            <button
              key={group.id}
              onClick={() => toggle(group.id)}
              className={cn(
                'glass rounded-2xl p-4 text-left transition-all duration-200 active:scale-95',
                isSelected
                  ? 'border border-amber-500/50 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                  : 'border border-white/10 hover:border-white/20',
                !isSelected && selected.length >= MAX_PICKS && 'opacity-40',
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Grupo {group.id}
                </span>
                {isSelected && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full
                                   bg-amber-500 text-zinc-950 text-[10px] font-bold">
                    {rank + 1}
                  </span>
                )}
                {!isSelected && selected.length < MAX_PICKS && (
                  <div className="w-5 h-5 rounded-full border border-white/15 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white/20" />
                  </div>
                )}
              </div>

              {/* Team list */}
              <ul className="space-y-1.5">
                {group.teams.map((team, i) => (
                  <li key={team.id} className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] font-bold w-4 text-center',
                      i === 2 ? 'text-amber-500' : 'text-white/20',
                    )}>
                      {i + 1}
                    </span>
                    {team.flag_url && (
                      <img
                        src={team.flag_url}
                        alt={team.name}
                        className="w-4 h-3 object-cover rounded-sm"
                      />
                    )}
                    <span className={cn(
                      'text-xs truncate',
                      i === 2 ? 'text-white/80 font-medium' : 'text-white/40',
                    )}>
                      {team.name}
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Save bar */}
      {isDirty && (
        <div className="fixed bottom-24 inset-x-4 z-40">
          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="w-full glass border border-amber-500/40 bg-amber-500/10 rounded-2xl
                       py-3.5 text-sm font-semibold text-amber-400 active:scale-95
                       transition-all duration-200 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : `Guardar ${selected.length} seleccionados`}
          </button>
        </div>
      )}

      {savedAt && !isDirty && (
        <p className="text-center text-xs text-white/30">
          Guardado correctamente ✓
        </p>
      )}
    </div>
  )
}
