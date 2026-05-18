'use client'

import { useEffect, useState } from 'react'
import { Clock, Lock } from 'lucide-react'

interface Props {
  deadline: string // ISO string — first match kickoff
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calcTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const totalSec = Math.floor(diff / 1000)
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: false,
  }
}

function Pad({ n }: { n: number }) {
  return <>{String(n).padStart(2, '0')}</>
}

export function DeadlineCountdown({ deadline }: Props) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(deadline))

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(deadline)), 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (time.expired) {
    return (
      <div
        className="mx-4 mt-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl border"
        style={{
          background: 'rgba(206,17,38,0.08)',
          borderColor: 'rgba(206,17,38,0.20)',
        }}
      >
        <Lock className="w-4 h-4 shrink-0" style={{ color: '#CE1126' }} />
        <div>
          <p className="text-xs font-bold text-white/80">Predicciones cerradas</p>
          <p className="text-[10px] text-white/40">El torneo ya comenzó — tus picks están guardados</p>
        </div>
      </div>
    )
  }

  const urgent = time.days === 0 && time.hours < 24

  return (
    <div
      className="mx-4 mt-4 rounded-2xl border p-4"
      style={{
        background: urgent
          ? 'linear-gradient(135deg, rgba(206,17,38,0.10) 0%, rgba(1,9,21,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(0,85,184,0.10) 0%, rgba(1,9,21,0.95) 100%)',
        borderColor: urgent ? 'rgba(206,17,38,0.25)' : 'rgba(0,100,220,0.25)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5" style={{ color: urgent ? '#CE1126' : '#4499FF' }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Cierre de predicciones
        </p>
      </div>

      <div className="flex items-end gap-3">
        {time.days > 0 && (
          <Unit value={time.days} label="días" urgent={urgent} />
        )}
        <Unit value={time.hours}   label="horas" urgent={urgent} />
        <Unit value={time.minutes} label="min"   urgent={urgent} />
        <Unit value={time.seconds} label="seg"   urgent={urgent} />
      </div>

      <p className="text-[10px] text-white/30 mt-2.5 leading-relaxed">
        Puedes editar tus predicciones hasta que empiece el primer partido del Mundial.
      </p>
    </div>
  )
}

function Unit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-2xl font-black tabular-nums leading-none"
        style={{ color: urgent ? '#CE1126' : '#4499FF' }}
      >
        <Pad n={value} />
      </span>
      <span className="text-[9px] text-white/30 uppercase tracking-widest">{label}</span>
    </div>
  )
}
