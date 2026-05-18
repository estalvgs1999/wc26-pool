/**
 * Dev tool — view current mock state + all fixtures with their IDs
 *
 * GET /api/mock/football/status
 * GET /api/mock/football/status?group=A        (filter by group)
 * GET /api/mock/football/status?pending=true   (only unset fixtures)
 *
 * Only available in development.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

if (process.env.NODE_ENV === 'production') {
  throw new Error('Mock API must not be used in production')
}

const STATE_PATH = path.join(process.cwd(), 'scripts', 'mock-state.json')
const BASE_PATH  = path.join(process.cwd(), 'scripts', 'mock-base-fixtures.json')

export async function GET(request: NextRequest) {
  if (!existsSync(BASE_PATH)) {
    return NextResponse.json({ error: 'Run seed-test.mjs first' }, { status: 503 })
  }

  const { response: base } = JSON.parse(readFileSync(BASE_PATH, 'utf8'))
  const state = existsSync(STATE_PATH)
    ? JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    : { results: {} }

  const groupFilter   = request.nextUrl.searchParams.get('group')?.toUpperCase()
  const pendingOnly   = request.nextUrl.searchParams.get('pending') === 'true'

  const fixtures = base
    .filter((f: { league: { round: string } }) => {
      if (!groupFilter) return true
      return f.league.round.endsWith(groupFilter)
    })
    .map((f: {
      fixture: { id: number; date: string }
      teams: { home: { name: string }; away: { name: string } }
      league: { round: string }
      _match_id: number
    }) => {
      const result = state.results[String(f.fixture.id)] ?? null
      return {
        fixture_id: f.fixture.id,
        match_id:   f._match_id,
        round:      f.league.round,
        home:       f.teams.home.name,
        away:       f.teams.away.name,
        date:       f.fixture.date,
        result,
      }
    })
    .filter((f: { result: unknown }) => !pendingOnly || f.result === null)

  const setCount     = Object.keys(state.results).length
  const pendingCount = base.length - setCount

  return NextResponse.json({
    summary: {
      total:    base.length,
      set:      setCount,
      pending:  pendingCount,
    },
    fixtures,
    set_result_example: {
      method:  'POST',
      url:     '/api/mock/football/set-result',
      body:    { fixture_id: base[0]?.fixture.id, status: 'FT', home: 2, away: 1 },
    },
  })
}
