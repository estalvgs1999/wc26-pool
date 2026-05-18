'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Team } from '@/types'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (team: Team) => void
  teams: Team[]
  title?: string
  description?: string
}

import { FlagImg } from '@/components/ui/FlagImg'

export function BottomSheet({
  isOpen,
  onClose,
  onSelect,
  teams,
  title = 'Seleccionar Equipo',
  description,
}: BottomSheetProps) {
  const [query, setQuery]         = useState('')
  const searchRef                 = useRef<HTMLInputElement>(null)
  const sheetRef                  = useRef<HTMLDivElement>(null)
  const startY                    = useRef<number | null>(null)
  const isDragging                = useRef(false)

  // Reset search on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      // Small delay so the animation settles before focusing
      setTimeout(() => searchRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Touch-drag to dismiss
  function onTouchStart(e: React.TouchEvent) {
    startY.current  = e.touches[0].clientY
    isDragging.current = false
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 10) {
      isDragging.current = true
      const sheet = sheetRef.current
      if (sheet) sheet.style.transform = `translateY(${Math.max(0, delta)}px)`
    }
  }
  function onTouchEnd() {
    const sheet = sheetRef.current
    if (!sheet) return
    const delta = parseFloat(sheet.style.transform.replace(/[^0-9.]/g, '') || '0')
    if (delta > 100) {
      onClose()
    } else {
      sheet.style.transform = ''
    }
    startY.current = null
    isDragging.current = false
  }

  const filtered = query.trim()
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.code.toLowerCase().includes(query.toLowerCase()),
      )
    : teams

  const grouped = filtered.reduce<Record<string, Team[]>>((acc, team) => {
    const key = team.group_id ?? '?'
    ;(acc[key] ??= []).push(team)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-zinc-900 border-t border-white/10',
          'rounded-t-3xl',
          'flex flex-col',
          'max-h-[85dvh]',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {description && (
              <p className="text-xs text-white/40 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3.5 h-10 border border-white/10">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo o grupo…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-3.5 h-3.5 text-white/30" />
              </button>
            )}
          </div>
        </div>

        {/* Team list — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm text-white/40">Sin resultados para &quot;{query}&quot;</p>
            </div>
          ) : query.trim() ? (
            // Flat list when searching
            <ul className="space-y-1.5 pb-6">
              {filtered.map((team) => (
                <TeamRow key={team.id} team={team} onSelect={() => { onSelect(team); onClose() }} />
              ))}
            </ul>
          ) : (
            // Grouped by group_id when browsing
            <div className="space-y-4 pb-6">
              {sortedGroups.map(([groupId, groupTeams]) => (
                <div key={groupId}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 px-1">
                    {groupId === '?' ? 'Sin grupo' : `Grupo ${groupId}`}
                  </p>
                  <ul className="space-y-1.5">
                    {groupTeams.map((team) => (
                      <TeamRow
                        key={team.id}
                        team={team}
                        onSelect={() => { onSelect(team); onClose() }}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function TeamRow({ team, onSelect }: { team: Team; onSelect: () => void }) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          'w-full flex items-center gap-3',
          'px-3.5 py-2.5 rounded-xl',
          'bg-white/5 border border-white/10',
          'hover:bg-white/10 hover:border-white/15',
          'active:scale-[0.98]',
          'transition-all duration-150 text-left',
        )}
      >
        <FlagImg url={team.flag_url} name={team.name} className="w-8 h-5 rounded-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{team.name}</p>
          <p className="text-[10px] text-white/30">{team.code}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-white/20 rotate-[-90deg] shrink-0" />
      </button>
    </li>
  )
}
