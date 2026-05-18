import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { MatchStage } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

// ── API-Football constants ────────────────────────────────────
// In dev, set API_FOOTBALL_BASE=http://localhost:3000/api/mock/football in .env.local
const AF_BASE    = process.env.API_FOOTBALL_BASE ?? 'https://v3.football.api-sports.io'
const AF_LEAGUE  = 1       // World Cup (same ID across seasons)
const AF_SEASON  = 2026

// Only process these API statuses
const LIVE_STATUSES     = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']
const FINISHED_STATUSES = ['FT', 'AET', 'PEN']

// ── Types ─────────────────────────────────────────────────────
interface AfTeam {
  id:     number
  name:   string
  winner: boolean | null
}

interface AfFixture {
  fixture: { id: number; date: string; status: { short: string } }
  league:  { round: string }
  teams:   { home: AfTeam; away: AfTeam }
  goals:   { home: number | null; away: number | null }
  score:   { fulltime: { home: number | null; away: number | null } }
}

interface SyncResult {
  processed: number
  scored:    number
  live:      number
  errors:    string[]
}

// ── Stage mapping ─────────────────────────────────────────────
function apiRoundToStage(round: string): MatchStage | null {
  const r = round.toLowerCase()
  if (r.includes('group'))          return 'group'
  if (r.includes('32'))             return 'round_of_32'
  if (r.includes('16'))             return 'round_of_16'
  if (r.includes('quarter'))        return 'quarter_final'
  if (r.includes('semi'))           return 'semi_final'
  if (r.includes('final') && !r.includes('semi') && !r.includes('3rd')) return 'final'
  return null
}

// ── Fetch fixtures from API-Football ─────────────────────────
async function fetchFixtures(statuses: string[]): Promise<AfFixture[]> {
  const params = new URLSearchParams({
    league: String(AF_LEAGUE),
    season: String(AF_SEASON),
    status: statuses.join('-'),
  })

  const res = await fetch(`${AF_BASE}/fixtures?${params}`, {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY!,
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) throw new Error(`API-Football ${res.status}: ${await res.text()}`)

  const json = await res.json()
  return json.response as AfFixture[]
}

// ── Match our DB row to an AF fixture ─────────────────────────
// First try by stored api_fixture_id, then by team names + date.
async function resolveMatch(
  supabase: ReturnType<typeof createClient<AnyRecord>>,
  fixture:  AfFixture,
) {
  // Fast path — already linked
  const { data: byId } = await supabase
    .from('matches')
    .select('*')
    .eq('api_fixture_id' as never, fixture.fixture.id)
    .maybeSingle()

  if (byId) return byId

  // Slow path — match by team names + date window (±12 h)
  const fixtureDate = new Date(fixture.fixture.date)
  const from = new Date(fixtureDate.getTime() - 12 * 3600_000).toISOString()
  const to   = new Date(fixtureDate.getTime() + 12 * 3600_000).toISOString()

  const { data: byName } = await supabase
    .from('matches')
    .select('*')
    .ilike('home_team', `%${fixture.teams.home.name}%`)
    .ilike('away_team', `%${fixture.teams.away.name}%`)
    .gte('scheduled_at', from)
    .lte('scheduled_at', to)
    .maybeSingle()

  if (byName) {
    // Store the fixture ID for future fast lookups
    await supabase
      .from('matches')
      .update({ api_fixture_id: fixture.fixture.id } as never)
      .eq('id', byName.id)
  }

  return byName
}

// ── Resolve team DB id from a match row ───────────────────────
function resolveWinnerTeamId(
  match:   AnyRecord,
  fixture: AfFixture,
): number | null {
  if (fixture.teams.home.winner === true)  return match.home_team_id
  if (fixture.teams.away.winner === true)  return match.away_team_id
  return null  // draw (group stage) or data not yet available
}

// ── Main handler ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Verify Vercel Cron authorization
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Service-role client — typed as any because generated DB types are not yet available.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const result: SyncResult = { processed: 0, scored: 0, live: 0, errors: [] }

  try {
    // Fetch live and recently finished fixtures in one call
    const fixtures = await fetchFixtures([...LIVE_STATUSES, ...FINISHED_STATUSES])

    for (const fixture of fixtures) {
      const stage = apiRoundToStage(fixture.league.round)
      if (!stage) continue  // 3rd place playoff or unknown round — skip

      const match = await resolveMatch(supabase, fixture)
      if (!match) {
        result.errors.push(`No match found for fixture ${fixture.fixture.id}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`)
        continue
      }

      result.processed++
      const statusShort = fixture.fixture.status.short

      // ── Live match ─────────────────────────────────────────
      if (LIVE_STATUSES.includes(statusShort) && match.status !== 'live') {
        await supabase.rpc('mark_match_live' as never, { p_match_id: match.id })
        result.live++
        continue
      }

      // ── Finished match ─────────────────────────────────────
      if (FINISHED_STATUSES.includes(statusShort) && match.status !== 'finished') {
        const scoreHome = fixture.score.fulltime.home ?? fixture.goals.home
        const scoreAway = fixture.score.fulltime.away ?? fixture.goals.away

        if (scoreHome === null || scoreAway === null) {
          result.errors.push(`Missing scores for fixture ${fixture.fixture.id}`)
          continue
        }

        if (stage === 'group') {
          const { error } = await supabase.rpc('score_group_match' as never, {
            p_match_id:   match.id,
            p_score_home: scoreHome,
            p_score_away: scoreAway,
          })
          if (error) result.errors.push(`score_group_match(${match.id}): ${error.message}`)
          else result.scored++

        } else {
          // Knockout — need a definitive winner (ET / penalties resolved)
          const winnerTeamId = resolveWinnerTeamId(match, fixture)
          if (!winnerTeamId) {
            result.errors.push(`Cannot determine winner for fixture ${fixture.fixture.id}`)
            continue
          }

          const { error } = await supabase.rpc('score_knockout_match' as never, {
            p_match_id:        match.id,
            p_score_home:      scoreHome,
            p_score_away:      scoreAway,
            p_winner_team_id:  winnerTeamId,
          })
          if (error) result.errors.push(`score_knockout_match(${match.id}): ${error.message}`)
          else result.scored++
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    result.errors.push(msg)
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}
