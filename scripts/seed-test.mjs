/**
 * WC26 Pool — Test seed
 *
 * Creates:
 *   - 6 auth users  (1 owner + 5 friends)
 *   - 6 profiles
 *   - 1 pool  (owned by user 0, all 6 as members)
 *   - predictions for all 72 group matches × 6 users
 *   - api_fixture_id on every match  (DB match id + FIXTURE_OFFSET)
 *   - scripts/mock-base-fixtures.json  (AF-format fixture list for the mock API)
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-test.mjs
 *
 * Re-running is safe — the script deletes its own test data first.
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const FIXTURE_OFFSET    = 90000   // fake api_fixture_id = FIXTURE_OFFSET + match.id

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Test users ────────────────────────────────────────────────
const USERS = [
  { email: 'esteban@test.wc26',  username: 'Esteban',  password: 'test123456' },
  { email: 'carlos@test.wc26',   username: 'Carlos',   password: 'test123456' },
  { email: 'sofia@test.wc26',    username: 'Sofia',    password: 'test123456' },
  { email: 'diego@test.wc26',    username: 'Diego',    password: 'test123456' },
  { email: 'valeria@test.wc26',  username: 'Valeria',  password: 'test123456' },
  { email: 'rodrigo@test.wc26',  username: 'Rodrigo',  password: 'test123456' },
]

// ── Prediction strategies (per user index) ────────────────────
// Returns [home, away] given match position (0-71)
function predict(userIdx, matchIdx) {
  const strategies = [
    // Esteban — home wins, occasional draws
    (i) => { const r = i % 5; return r < 3 ? [2, 1] : r < 4 ? [1, 1] : [3, 0] },
    // Carlos — balanced, likes draws
    (i) => { const r = i % 4; return r < 2 ? [1, 1] : r < 3 ? [2, 1] : [1, 0] },
    // Sofia — high scoring
    (i) => { const r = i % 4; return r < 2 ? [3, 1] : r < 3 ? [4, 0] : [2, 2] },
    // Diego — always 1-0 home win (boring but consistent)
    (_) => [1, 0],
    // Valeria — loves 0-0, otherwise away upsets
    (i) => { const r = i % 5; return r < 2 ? [0, 0] : r < 3 ? [0, 1] : [1, 1] },
    // Rodrigo — mixed chaos
    (i) => {
      const opts = [[2,0],[1,1],[3,2],[0,0],[2,1],[1,0],[2,2],[3,1]]
      return opts[(i * 7 + userIdx * 13) % opts.length]
    },
  ]
  return strategies[userIdx](matchIdx)
}

// ── Cleanup helpers ───────────────────────────────────────────
async function cleanupPrevious(emails) {
  console.log('🧹  Cleaning up previous test data…')

  // Get existing users by email
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const testUsers = users.filter(u => emails.includes(u.email))

  for (const u of testUsers) {
    // Predictions and pool_members cascade from profiles/pools
    await supabase.auth.admin.deleteUser(u.id)
  }

  // Clear fixture IDs on matches (so they're clean for the seed)
  await supabase.from('matches').update({ api_fixture_id: null }).neq('id', 0)

  console.log(`  Removed ${testUsers.length} existing test users`)
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const emails = USERS.map(u => u.email)

  await cleanupPrevious(emails)

  // 1 ── Create auth users + profiles
  console.log('\n👤  Creating users…')
  const userIds = []

  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email:             u.email,
      password:          u.password,
      email_confirm:     true,
      user_metadata:     { username: u.username },
    })
    if (error) { console.error(`  ❌ ${u.username}: ${error.message}`); process.exit(1) }

    userIds.push(data.user.id)

    // Upsert profile (trigger may have fired already)
    await supabase.from('profiles').upsert(
      { id: data.user.id, username: u.username },
      { onConflict: 'id', ignoreDuplicates: true },
    )
    console.log(`  ✅ ${u.username}  (${data.user.id.slice(0, 8)}…)`)
  }

  // 2 ── Create pool
  console.log('\n🏆  Creating pool…')
  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .insert({ name: 'Quiniela Test WC26', owner_id: userIds[0] })
    .select('id, invite_code')
    .single()

  if (poolErr) { console.error('  ❌', poolErr.message); process.exit(1) }
  console.log(`  Pool: ${pool.id.slice(0, 8)}…  código: ${pool.invite_code}`)

  // 3 ── Add all users as pool members
  console.log('\n👥  Adding members…')
  const memberRows = userIds.map(uid => ({ pool_id: pool.id, user_id: uid }))
  const { error: memberErr } = await supabase.from('pool_members').insert(memberRows)
  if (memberErr) { console.error('  ❌', memberErr.message); process.exit(1) }
  console.log(`  ${userIds.length} members added`)

  // 4 ── Load group matches + assign fake fixture IDs
  console.log('\n⚽  Loading matches and assigning fixture IDs…')
  const { data: matches, error: matchErr } = await supabase
    .from('matches')
    .select('id, home_team, away_team, home_team_id, away_team_id, group_id, scheduled_at, venue, stage')
    .eq('stage', 'group')
    .order('scheduled_at', { ascending: true })

  if (matchErr || !matches?.length) {
    console.error('  ❌ Could not load matches. Did you run the migrations?', matchErr?.message)
    process.exit(1)
  }

  // Update all matches with their fake fixture ID
  for (const m of matches) {
    await supabase
      .from('matches')
      .update({ api_fixture_id: FIXTURE_OFFSET + m.id })
      .eq('id', m.id)
  }
  console.log(`  ${matches.length} matches tagged with fixture IDs (${FIXTURE_OFFSET + matches[0].id}–${FIXTURE_OFFSET + matches[matches.length - 1].id})`)

  // 5 ── Generate predictions for all users × all matches
  console.log('\n🎯  Generating predictions…')
  const predRows = []

  for (let ui = 0; ui < USERS.length; ui++) {
    for (let mi = 0; mi < matches.length; mi++) {
      const [home, away] = predict(ui, mi)
      predRows.push({
        user_id:   userIds[ui],
        pool_id:   pool.id,
        match_id:  matches[mi].id,
        pred_home: home,
        pred_away: away,
      })
    }
  }

  // Insert in batches of 200 to avoid payload limits
  const BATCH = 200
  for (let i = 0; i < predRows.length; i += BATCH) {
    const { error } = await supabase
      .from('predictions_groups')
      .upsert(predRows.slice(i, i + BATCH), { onConflict: 'user_id,match_id,pool_id' })
    if (error) { console.error(`  ❌ Batch ${i}: ${error.message}`); process.exit(1) }
  }
  console.log(`  ${predRows.length} predictions inserted (${USERS.length} users × ${matches.length} matches)`)

  // 6 ── Write mock-base-fixtures.json
  console.log('\n📄  Writing mock-base-fixtures.json…')

  const ROUND_MAP = {
    A: 'Group Stage - 1', B: 'Group Stage - 1', C: 'Group Stage - 1',
    D: 'Group Stage - 1', E: 'Group Stage - 1', F: 'Group Stage - 1',
    G: 'Group Stage - 1', H: 'Group Stage - 1', I: 'Group Stage - 1',
    J: 'Group Stage - 1', K: 'Group Stage - 1', L: 'Group Stage - 1',
  }

  const baseFixtures = matches.map((m) => ({
    fixture: {
      id:     FIXTURE_OFFSET + m.id,
      date:   m.scheduled_at,
      status: { short: 'NS', long: 'Not Started', elapsed: null },
    },
    league: {
      id:     1,
      name:   'FIFA World Cup',
      season: 2026,
      round:  `Group Stage - ${m.group_id}`,
    },
    teams: {
      home: { id: m.home_team_id ?? 0, name: m.home_team, logo: null, winner: null },
      away: { id: m.away_team_id ?? 0, name: m.away_team, logo: null, winner: null },
    },
    goals:  { home: null, away: null },
    score:  { fulltime: { home: null, away: null } },
    // Extra: our internal match id for convenience in the control UI
    _match_id: m.id,
  }))

  const outPath = path.join(__dirname, 'mock-base-fixtures.json')
  writeFileSync(outPath, JSON.stringify({ response: baseFixtures }, null, 2))
  console.log(`  Written to scripts/mock-base-fixtures.json`)

  // 7 ── Reset mock state
  const statePath = path.join(__dirname, 'mock-state.json')
  writeFileSync(statePath, JSON.stringify({ results: {} }, null, 2))
  console.log('  mock-state.json reset')

  // ── Summary ───────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Seed complete!

👤  Users (password: test123456)
${USERS.map((u, i) => `   ${u.username.padEnd(10)} ${u.email}  id: ${userIds[i].slice(0, 8)}…`).join('\n')}

🏆  Pool
    id:    ${pool.id}
    code:  ${pool.invite_code}

⚽  Matches:     ${matches.length}
🎯  Predictions: ${predRows.length}

🚀  Next steps:
    1. Add to .env.local:
       API_FOOTBALL_BASE=http://localhost:3000/api/mock/football

    2. Start the dev server:
       npm run dev

    3. Trigger the cron:
       curl -H "Authorization: Bearer \$CRON_SECRET" \\
            http://localhost:3000/api/cron/sync

    4. Set match results:
       curl -X POST http://localhost:3000/api/mock/football/set-result \\
            -H "Content-Type: application/json" \\
            -d '{"fixture_id": ${FIXTURE_OFFSET + matches[0].id}, "status": "FT", "home": 2, "away": 1}'

    5. View mock state:
       http://localhost:3000/api/mock/football/status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
