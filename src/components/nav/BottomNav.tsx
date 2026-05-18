'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Trophy, BarChart3, Users, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Inicio',    icon: Home },
  { href: '/pools',        label: 'Quinielas', icon: Users },
  { href: '/matches',      label: 'Partidos',  icon: CalendarDays },
  { href: '/bracket',      label: 'Bracket',   icon: Trophy },
  { href: '/leaderboard',  label: 'Tabla',     icon: BarChart3 },
  { href: '/instructions', label: 'Reglas',    icon: BookOpen },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-pb">
      {/* Tricolor top border */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, #006847 0%, #006847 33%, rgba(255,255,255,0.35) 50%, #CE1126 67%, #CE1126 100%)' }}
      />

      {/* Nav background */}
      <div className="absolute inset-0 backdrop-blur-2xl"
        style={{ background: 'rgba(1,9,21,0.92)' }}
      />

      <ul className="relative flex items-center justify-around px-1 h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 rounded-xl',
                  'transition-all duration-200 active:scale-90',
                  active ? 'text-white' : 'text-white/25 hover:text-white/50',
                )}
              >
                <div className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                )}
                  style={active ? {
                    background: 'linear-gradient(145deg, rgba(0,85,184,0.70) 0%, rgba(0,50,140,0.80) 100%)',
                    border: '1px solid rgba(0,120,255,0.30)',
                    boxShadow: '0 2px 12px rgba(0,85,184,0.40), inset 0 1px 0 rgba(100,170,255,0.20)',
                  } : undefined}
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} strokeWidth={active ? 2.5 : 1.75} />
                </div>
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-wider transition-all',
                  active ? 'opacity-100 text-white/80' : 'opacity-0',
                )}>
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
