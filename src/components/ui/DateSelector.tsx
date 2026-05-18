'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  dates:       Date[]
  selectedDate: Date
  onSelect:    (date: Date) => void
  // date.toISOString() → fill status for that day
  dateStatus?: Record<string, 'complete' | 'partial' | 'none'>
  className?:  string
}

const DAY_LABELS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate()
}

export function DateSelector({ dates, selectedDate, onSelect, dateStatus, className }: DateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    const active    = activeRef.current
    if (!container || !active) return
    const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2
    container.scrollTo({ left: offset, behavior: 'smooth' })
  }, [selectedDate])

  return (
    <div className={cn('w-full', className)}>
      <p className="px-4 mb-2 text-xs font-medium tracking-widest uppercase text-white/40">
        {MONTH_LABELS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </p>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => {
          const active = isSameDay(date, selectedDate)
          const status = dateStatus?.[date.toISOString()] ?? 'none'

          return (
            <button
              key={date.toISOString()}
              ref={active ? activeRef : null}
              onClick={() => onSelect(date)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'min-w-[48px] h-[64px] rounded-2xl shrink-0',
                'transition-all duration-200',
                active
                  ? 'bg-white text-zinc-950 shadow-lg shadow-white/10'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 active:scale-95',
              )}
            >
              <span className={cn(
                'text-[10px] font-medium uppercase tracking-wider',
                active ? 'text-zinc-500' : 'text-white/40',
              )}>
                {DAY_LABELS[date.getDay()]}
              </span>

              <span className={cn(
                'text-xl font-semibold leading-none',
                active ? 'text-zinc-950' : 'text-white',
              )}>
                {date.getDate()}
              </span>

              {/* Fill status indicator */}
              {active ? (
                // Active pill: show status dot in dark color so it's visible on white bg
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  status === 'complete' ? 'bg-green-600'
                  : status === 'partial' ? 'bg-amber-500'
                  : 'bg-zinc-300',
                )} />
              ) : (
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  status === 'complete' ? 'bg-green-500'
                  : status === 'partial' ? 'bg-amber-400'
                  : 'bg-white/10',
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
