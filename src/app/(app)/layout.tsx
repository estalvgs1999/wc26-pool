import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/nav/BottomNav'
import { PoolBar } from '@/components/nav/PoolBar'
import { OnboardingModal } from '@/components/ui/OnboardingModal'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let onboardingDone = true
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    onboardingDone = (data as { onboarding_done?: boolean } | null)?.onboarding_done ?? false
  }

  return (
    <>
      <main className="pb-24 min-h-dvh">
        <PoolBar />
        {children}
      </main>
      <BottomNav />
      {!onboardingDone && <OnboardingModal />}
    </>
  )
}
