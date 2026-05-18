import type {
  KnockoutStage,
  GroupScoringResult,
  BracketScoringResult,
} from '@/types'

// ── Group Stage Points ────────────────────────────────────────
const GROUP_POINTS = {
  exact_score:     5,
  goal_diff:       3,
  correct_winner:  1,
} as const

// ── Knockout Stage Points ─────────────────────────────────────
const LEGACY_POINTS: Record<KnockoutStage, number> = {
  round_of_32:   10,
  round_of_16:   20,
  quarter_final: 40,
  semi_final:    80,
  final:        150,
}

// Recovery = 40% of legacy value, floored to integer
const RECOVERY_POINTS: Record<KnockoutStage, number> = Object.fromEntries(
  (Object.entries(LEGACY_POINTS) as [KnockoutStage, number][]).map(
    ([stage, pts]) => [stage, Math.floor(pts * 0.4)]
  )
) as Record<KnockoutStage, number>

// ── Group Stage Scoring ───────────────────────────────────────
export function calculateGroupPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): GroupScoringResult {
  // Exact scoreline
  if (predHome === actualHome && predAway === actualAway) {
    return { points: GROUP_POINTS.exact_score, type: 'exact_score' }
  }

  const predDiff   = predHome - predAway
  const actualDiff = actualHome - actualAway

  // Same goal difference (and same sign — covers draws, home wins, away wins)
  if (predDiff === actualDiff) {
    return { points: GROUP_POINTS.goal_diff, type: 'goal_diff' }
  }

  // At least correct winner / draw direction
  const predResult   = Math.sign(predDiff)
  const actualResult = Math.sign(actualDiff)
  if (predResult === actualResult) {
    return { points: GROUP_POINTS.correct_winner, type: 'correct_winner' }
  }

  return { points: 0, type: 'no_points' }
}

// ── Knockout Stage Scoring ────────────────────────────────────
/**
 * @param teamAdvanced  Did the predicted team actually advance through this stage?
 * @param isLegacy      Was this pick placed before the tournament started?
 * @param stage         Which knockout round is being evaluated?
 */
export function calculateBracketPoints(
  teamAdvanced: boolean,
  isLegacy: boolean,
  stage: KnockoutStage,
): BracketScoringResult {
  if (!teamAdvanced) {
    return { points: 0, type: 'no_points' }
  }
  if (isLegacy) {
    return { points: LEGACY_POINTS[stage], type: 'legacy' }
  }
  return { points: RECOVERY_POINTS[stage], type: 'recovery' }
}

// ── Points Potential (shown at pick time) ─────────────────────
export function getPointsPotential(
  stage: KnockoutStage,
  isLegacy: boolean,
): number {
  return isLegacy ? LEGACY_POINTS[stage] : RECOVERY_POINTS[stage]
}

// ── Batch: score all group predictions for a finished match ───
export function scoreGroupPredictions<
  T extends { pred_home: number; pred_away: number },
>(
  predictions: T[],
  actualHome: number,
  actualAway: number,
): (T & { points_earned: number })[] {
  return predictions.map((p) => ({
    ...p,
    points_earned: calculateGroupPoints(
      p.pred_home,
      p.pred_away,
      actualHome,
      actualAway,
    ).points,
  }))
}

// ── Stage display helpers ─────────────────────────────────────
export const STAGE_LABELS: Record<KnockoutStage, string> = {
  round_of_32:   'R32',
  round_of_16:   'R16',
  quarter_final: 'QF',
  semi_final:    'SF',
  final:         'FINAL',
}

export const KNOCKOUT_STAGES: KnockoutStage[] = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'final',
]
