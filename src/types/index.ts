// ── Enums ────────────────────────────────────────────────────
export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'final'

export type KnockoutStage = Exclude<MatchStage, 'group'>

export type MatchStatus = 'scheduled' | 'live' | 'finished'

// ── Domain models ─────────────────────────────────────────────
export interface Team {
  id: number
  name: string
  code: string
  flag_url: string | null
  group_id: string | null
  created_at: string
}

export interface Match {
  id: number
  home_team_id: number | null
  away_team_id: number | null
  home_team: string
  away_team: string
  score_home: number | null
  score_away: number | null
  stage: MatchStage
  status: MatchStatus
  group_id: string | null
  scheduled_at: string
  venue: string | null
  created_at: string
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  total_points: number
  is_admin: boolean
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface Pool {
  id: string
  name: string
  description: string | null
  owner_id: string
  invite_code: string
  created_at: string
  updated_at: string
}

export interface PoolMember {
  id: string
  pool_id: string
  user_id: string
  joined_at: string
}

export interface Invitation {
  id: string
  email: string
  invited_by: string | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface PredictionGroup {
  id: string
  user_id: string
  pool_id: string | null
  match_id: number
  pred_home: number
  pred_away: number
  points_earned: number
  scored_at: string | null
  created_at: string
  updated_at: string
}

export interface BracketPick {
  id: string
  user_id: string
  pool_id: string | null
  team_id: number
  stage: KnockoutStage
  position: number
  is_legacy: boolean
  can_edit: boolean
  version: number
  points_potential: number
  points_earned: number
  created_at: string
  updated_at: string
}

export interface ThirdPlacePick {
  id: string
  user_id: string
  group_id: string
  slot_rank: number
  created_at: string
  updated_at: string
}

// ── Scoring result types ──────────────────────────────────────
export type GroupScoreType = 'exact_score' | 'goal_diff' | 'correct_winner' | 'no_points'
export type BracketScoreType = 'legacy' | 'recovery' | 'no_points'

export interface GroupScoringResult {
  points: number
  type: GroupScoreType
}

export interface BracketScoringResult {
  points: number
  type: BracketScoreType
}

// ── Database type for Supabase client ────────────────────────
export interface Database {
  public: {
    Tables: {
      teams: {
        Row:    Team
        Insert: Omit<Team, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Team, 'id'>>
      }
      matches: {
        Row:    Match
        Insert: Omit<Match, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Match, 'id'>>
      }
      profiles: {
        Row:    Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'onboarding_done'> & { created_at?: string; updated_at?: string; onboarding_done?: boolean }
        Update: Partial<Omit<Profile, 'id'>>
      }
      pools: {
        Row:    Pool
        Insert: Omit<Pool, 'id' | 'invite_code' | 'created_at' | 'updated_at'> & { id?: string; invite_code?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Pool, 'id' | 'owner_id'>>
      }
      pool_members: {
        Row:    PoolMember
        Insert: Omit<PoolMember, 'id' | 'joined_at'> & { id?: string; joined_at?: string }
        Update: never
      }
      invitations: {
        Row:    Invitation
        Insert: Omit<Invitation, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Invitation, 'id'>>
      }
      predictions_groups: {
        Row:    PredictionGroup
        Insert: Omit<PredictionGroup, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<PredictionGroup, 'id' | 'user_id' | 'match_id'>>
      }
      bracket_picks: {
        Row:    BracketPick
        Insert: Omit<BracketPick, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<BracketPick, 'id' | 'user_id'>>
      }
      third_place_picks: {
        Row:    ThirdPlacePick
        Insert: Omit<ThirdPlacePick, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ThirdPlacePick, 'id' | 'user_id'>>
      }
    }
    Views:     Record<string, never>
    Functions: Record<string, never>
    Enums:     Record<string, never>
  }
}
