import type { Match, PredictionGroup, Team } from '@/types'

export interface TeamStanding {
  team:          Team
  group_id:      string
  points:        number
  played:        number
  goals_for:     number
  goals_against: number
  goal_diff:     number
}

export interface GroupStanding {
  group_id:  string
  standings: TeamStanding[]   // sorted 1st → 4th
}

export interface Qualifiers {
  first:     Map<string, Team>  // groupId → predicted 1st
  second:    Map<string, Team>  // groupId → predicted 2nd
  thirdBest: Team[]             // top-8 3rd-place teams, in rank order
}

function applyResult(
  stats:  Map<number, TeamStanding>,
  homeId: number, awayId: number,
  homeG:  number, awayG:  number,
) {
  const home = stats.get(homeId)!
  const away = stats.get(awayId)!
  home.played++; away.played++
  home.goals_for     += homeG; home.goals_against += awayG
  away.goals_for     += awayG; away.goals_against += homeG
  home.goal_diff = home.goals_for - home.goals_against
  away.goal_diff = away.goals_for - away.goals_against
  if (homeG > awayG)       { home.points += 3 }
  else if (homeG === awayG) { home.points += 1; away.points += 1 }
  else                      { away.points += 3 }
}

function compareStandings(a: TeamStanding, b: TeamStanding): number {
  if (b.points    !== a.points)    return b.points    - a.points
  if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff
  return b.goals_for - a.goals_for
}

export function calculateGroupStandings(
  matches:     Match[],
  predictions: PredictionGroup[],
  teamById:    Map<number, Team>,
): GroupStanding[] {
  const predMap = new Map(predictions.map(p => [p.match_id, p]))

  // Initialize stats for every group team
  const statsMap = new Map<number, TeamStanding>()
  for (const team of Array.from(teamById.values())) {
    if (!team.group_id) continue
    statsMap.set(team.id, {
      team, group_id: team.group_id,
      points: 0, played: 0,
      goals_for: 0, goals_against: 0, goal_diff: 0,
    })
  }

  // Apply results (actual if finished, else predicted)
  for (const match of matches) {
    if (match.stage !== 'group') continue
    if (!match.home_team_id || !match.away_team_id) continue
    if (!statsMap.has(match.home_team_id) || !statsMap.has(match.away_team_id)) continue

    let homeG: number | null = null
    let awayG: number | null = null

    if (match.status === 'finished' && match.score_home != null && match.score_away != null) {
      homeG = match.score_home
      awayG = match.score_away
    } else {
      const pred = predMap.get(match.id)
      if (pred) { homeG = pred.pred_home; awayG = pred.pred_away }
    }

    if (homeG === null || awayG === null) continue
    applyResult(statsMap, match.home_team_id, match.away_team_id, homeG, awayG)
  }

  // Group and sort
  const byGroup = new Map<string, TeamStanding[]>()
  for (const stat of Array.from(statsMap.values())) {
    const arr = byGroup.get(stat.group_id) ?? []
    arr.push(stat)
    byGroup.set(stat.group_id, arr)
  }

  return Array.from(byGroup.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group_id, standings]) => ({
      group_id,
      standings: standings.sort(compareStandings),
    }))
}

export function resolveQualifiers(groupStandings: GroupStanding[]): Qualifiers {
  const first  = new Map<string, Team>()
  const second = new Map<string, Team>()
  const thirds: Array<{ team: Team; stats: TeamStanding }> = []

  for (const { group_id, standings } of groupStandings) {
    // Only mark as qualified if the team has actually played (has a prediction/result)
    if (standings[0]?.played > 0) first.set(group_id, standings[0].team)
    if (standings[1]?.played > 0) second.set(group_id, standings[1].team)
    if (standings[2]?.played > 0) thirds.push({ team: standings[2].team, stats: standings[2] })
  }

  thirds.sort((a, b) => compareStandings(a.stats, b.stats))

  return {
    first,
    second,
    thirdBest: thirds.slice(0, 8).map(t => t.team),
  }
}

// Resolve all possible teams for a slot (1 for deterministic slots, N for 3rd-place slots)
export function resolveSlotCandidates(
  slotLabel:  string,
  groups:     string[],
  qualifiers: Qualifiers,
): Team[] {
  if (slotLabel.startsWith('1') && groups.length === 1) {
    const t = qualifiers.first.get(groups[0])
    return t ? [t] : []
  }
  if (slotLabel.startsWith('2') && groups.length === 1) {
    const t = qualifiers.second.get(groups[0])
    return t ? [t] : []
  }
  // 3rd-place slot: ALL qualifying 3rd-place teams from eligible groups
  return qualifiers.thirdBest.filter(t => t.group_id && groups.includes(t.group_id))
}
