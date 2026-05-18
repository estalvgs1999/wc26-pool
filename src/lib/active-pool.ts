import { cookies } from 'next/headers'

const COOKIE = 'wc26_active_pool'

export async function getActivePoolId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(COOKIE)?.value ?? null
}

export async function setActivePoolId(poolId: string): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE, poolId, {
    path:     '/',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearActivePoolId(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE)
}
