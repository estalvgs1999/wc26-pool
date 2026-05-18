'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { markOnboardingDone } from '@/app/(app)/instructions/actions'
import { ONBOARDING_SLIDES } from '@/lib/onboarding-slides'

export function OnboardingModal() {
  const router = useRouter()
  const [step, setStep]     = useState(0)
  const [visible, setVisible] = useState(true)
  const [, startTransition] = useTransition()
  const slide  = ONBOARDING_SLIDES[step]
  const isLast = step === ONBOARDING_SLIDES.length - 1

  function dismiss() {
    setVisible(false)
    startTransition(async () => {
      await markOnboardingDone()
      router.refresh()
    })
  }

  function handleNext() {
    if (!isLast) { setStep((s) => s + 1); return }
    dismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#010915' }}>
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: '#006847', transform: 'translate(-40%, -40%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: '#CE1126', transform: 'translate(40%, 40%)' }}
      />

      {/* Progress bar + skip */}
      <div className="relative safe-pt px-6 pt-6 flex items-center gap-3">
        <div className="flex gap-1.5 flex-1">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step
                  ? 'linear-gradient(90deg, #006847, #F5A623)'
                  : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
        {!isLast && (
          <button
            onClick={dismiss}
            className="text-xs text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            Saltar
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-2 shadow-2xl"
          style={{ background: slide.iconBg, border: `1px solid ${slide.iconBorder}` }}
        >
          {slide.icon}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
            {step + 1} de {ONBOARDING_SLIDES.length}
          </p>
          <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
          <p className="text-sm text-white/55 leading-relaxed max-w-xs mx-auto">{slide.body}</p>
        </div>

        {/* Scoring table or detail block */}
        {slide.detail && (
          <div
            className="w-full max-w-xs rounded-2xl border p-4 space-y-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
          >
            {slide.detail.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{row.icon}</span>
                  <span className="text-xs text-white/60">{row.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: row.color ?? '#F5A623' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative px-6 pb-10 safe-pb space-y-3">
        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === step ? 'w-5 h-1.5' : 'w-1.5 h-1.5',
              )}
              style={{
                background: i === step
                  ? 'linear-gradient(90deg, #006847, #CE1126)'
                  : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={cn(
            'w-full h-13 rounded-2xl font-black text-sm tracking-wide',
            'flex items-center justify-center gap-2',
            'transition-all duration-200 active:scale-[0.98]',
            isLast ? 'text-wc-navy' : 'text-white',
          )}
          style={{
            background: isLast
              ? 'linear-gradient(135deg, #F5A623 0%, #e09010 100%)'
              : 'linear-gradient(135deg, #006847 0%, #1a7a57 100%)',
            boxShadow: isLast
              ? '0 4px 24px rgba(245,166,35,0.35)'
              : '0 4px 24px rgba(0,104,71,0.35)',
            height: '3.25rem',
          }}
        >
          {isLast ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              ¡Entendido, a jugar!
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
