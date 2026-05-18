import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ONBOARDING_SLIDES } from '@/lib/onboarding-slides'

export default function InstructionsPage() {
  return (
    <div className="flex flex-col min-h-dvh pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-white/40 text-sm mb-5 hover:text-white/70 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Cómo jugar</p>
        <h1 className="text-2xl font-black text-white">Instrucciones</h1>
      </div>

      {/* Tricolor separator */}
      <div
        className="h-px mx-4 mt-3 mb-6 rounded-full"
        style={{ background: 'linear-gradient(90deg, #006847, rgba(255,255,255,0.3), #CE1126)' }}
      />

      {/* Slides as scroll cards */}
      <div className="px-4 space-y-4">
        {ONBOARDING_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="rounded-2xl border p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: slide.iconBg, border: `1px solid ${slide.iconBorder}` }}
              >
                {slide.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white mb-1">{slide.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{slide.body}</p>
              </div>
            </div>

            {/* Detail rows */}
            {slide.detail && (
              <div
                className="mt-4 rounded-xl border p-3 space-y-2"
                style={{ background: 'rgba(0,0,0,0.20)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {slide.detail.map((row, j) => (
                  <div key={j} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{row.icon}</span>
                      <span className="text-xs text-white/50">{row.label}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: row.color ?? '#F5A623' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-white/20 mt-8 px-8">
        Las instrucciones siempre están disponibles aquí desde el menú.
      </p>
    </div>
  )
}
