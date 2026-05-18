/**
 * Control endpoint — set or clear a mock match result
 *
 * POST /api/mock/football/set-result
 * Body: { fixture_id: 90001, status: "FT", home: 2, away: 1 }
 *
 * DELETE /api/mock/football/set-result
 * Body: { fixture_id: 90001 }
 *
 * Status codes:
 *   Live:     "1H" | "HT" | "2H"
 *   Finished: "FT" | "AET" | "PEN"
 *
 * Only available in development.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'

if (process.env.NODE_ENV === 'production') {
  throw new Error('Mock API must not be used in production')
}

const STATE_PATH = path.join(process.cwd(), 'scripts', 'mock-state.json')
const BASE_PATH  = path.join(process.cwd(), 'scripts', 'mock-base-fixtures.json')

const LIVE_STATUSES     = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

function readState() {
  return existsSync(STATE_PATH)
    ? JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    : { results: {} }
}

function writeState(state: object) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { fixture_id, status, home, away } = body

  if (!fixture_id || !status) {
    return NextResponse.json({ error: 'fixture_id and status are required' }, { status: 400 })
  }
  if (!LIVE_STATUSES.has(status) && !FINISHED_STATUSES.has(status)) {
    return NextResponse.json(
      { error: `Invalid status "${status}". Use: ${[...LIVE_STATUSES, ...FINISHED_STATUSES].join(', ')}` },
      { status: 400 },
    )
  }
  if (FINISHED_STATUSES.has(status) && (home == null || away == null)) {
    return NextResponse.json({ error: 'home and away scores required for finished status' }, { status: 400 })
  }

  const state = readState()
  state.results[String(fixture_id)] = {
    status,
    home: home ?? null,
    away: away ?? null,
  }
  writeState(state)

  // Look up the match name for the response
  let matchLabel = `fixture ${fixture_id}`
  if (existsSync(BASE_PATH)) {
    const { response } = JSON.parse(readFileSync(BASE_PATH, 'utf8'))
    const f = response.find((x: { fixture: { id: number } }) => x.fixture.id === Number(fixture_id))
    if (f) matchLabel = `${f.teams.home.name} vs ${f.teams.away.name} (match ${f._match_id})`
  }

  return NextResponse.json({
    ok:      true,
    fixture: matchLabel,
    result:  { status, home, away },
    hint:    'Now trigger the cron: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync',
  })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { fixture_id } = body

  if (!fixture_id) {
    return NextResponse.json({ error: 'fixture_id required' }, { status: 400 })
  }

  const state = readState()
  delete state.results[String(fixture_id)]
  writeState(state)

  return NextResponse.json({ ok: true, cleared: fixture_id })
}
