import type { KnockoutStage } from '@/types'

export interface BracketSlot {
  label:  string    // e.g. "1A", "2B", "3ro A/B/C"
  groups: string[]  // eligible group letters
}

export interface BracketMatchDef {
  id:       string
  stage:    KnockoutStage
  position: number
  // R32 only — which groups each slot can come from
  slot1?: BracketSlot
  slot2?: BracketSlot
  // R16+ — which positions in the PREVIOUS stage feed into this match
  feedsFrom?: [number, number]
}

export const STAGE_LABELS_ES: Record<KnockoutStage, string> = {
  round_of_32:   'Ronda de 32',
  round_of_16:   'Octavos de Final',
  quarter_final: 'Cuartos de Final',
  semi_final:    'Semifinal',
  final:         'Final',
}

export const STAGE_SHORT_ES: Record<KnockoutStage, string> = {
  round_of_32:   'R32',
  round_of_16:   'Octavos',
  quarter_final: 'Cuartos',
  semi_final:    'Semis',
  final:         'Final',
}

// Previous stage lookup for cascade resolution
export const PREV_STAGE: Partial<Record<KnockoutStage, KnockoutStage>> = {
  round_of_16:   'round_of_32',
  quarter_final: 'round_of_16',
  semi_final:    'quarter_final',
  final:         'semi_final',
}

export const KNOCKOUT_STAGE_ORDER: KnockoutStage[] = [
  'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final',
]

// Points per stage (legacy / recovery)
export const STAGE_POINTS: Record<KnockoutStage, { legacy: number; recovery: number }> = {
  round_of_32:   { legacy: 10,  recovery: 4  },
  round_of_16:   { legacy: 20,  recovery: 8  },
  quarter_final: { legacy: 40,  recovery: 16 },
  semi_final:    { legacy: 80,  recovery: 32 },
  final:         { legacy: 150, recovery: 60 },
}

// ── Official WC 2026 bracket ────────────────────────────────────────────────
// Source: FIFA / DAZN / ESPN — bracket published for the 48-team format
// Groups A-L (4 teams each). Top 2 per group + 8 best 3rd-place = 32 teams.
export const BRACKET_MATCHES: BracketMatchDef[] = [

  // ── Round of 32 (16 matches) ───────────────────────────────────────────
  {
    id: 'R32-1',  stage: 'round_of_32', position: 1,
    slot1: { label: '2A',            groups: ['A'] },
    slot2: { label: '2B',            groups: ['B'] },
  },
  {
    id: 'R32-2',  stage: 'round_of_32', position: 2,
    slot1: { label: '1E',            groups: ['E'] },
    slot2: { label: '3ro A/B/C/D/F', groups: ['A','B','C','D','F'] },
  },
  {
    id: 'R32-3',  stage: 'round_of_32', position: 3,
    slot1: { label: '1F',            groups: ['F'] },
    slot2: { label: '2C',            groups: ['C'] },
  },
  {
    id: 'R32-4',  stage: 'round_of_32', position: 4,
    slot1: { label: '1C',            groups: ['C'] },
    slot2: { label: '2F',            groups: ['F'] },
  },
  {
    id: 'R32-5',  stage: 'round_of_32', position: 5,
    slot1: { label: '1I',            groups: ['I'] },
    slot2: { label: '3ro C/D/F/G/H', groups: ['C','D','F','G','H'] },
  },
  {
    id: 'R32-6',  stage: 'round_of_32', position: 6,
    slot1: { label: '2E',            groups: ['E'] },
    slot2: { label: '2I',            groups: ['I'] },
  },
  {
    id: 'R32-7',  stage: 'round_of_32', position: 7,
    slot1: { label: '1A',            groups: ['A'] },
    slot2: { label: '3ro C/E/F/H/I', groups: ['C','E','F','H','I'] },
  },
  {
    id: 'R32-8',  stage: 'round_of_32', position: 8,
    slot1: { label: '1L',            groups: ['L'] },
    slot2: { label: '3ro E/H/I/J/K', groups: ['E','H','I','J','K'] },
  },
  {
    id: 'R32-9',  stage: 'round_of_32', position: 9,
    slot1: { label: '1D',            groups: ['D'] },
    slot2: { label: '3ro B/E/F/I/J', groups: ['B','E','F','I','J'] },
  },
  {
    id: 'R32-10', stage: 'round_of_32', position: 10,
    slot1: { label: '1G',            groups: ['G'] },
    slot2: { label: '3ro A/E/H/I/J', groups: ['A','E','H','I','J'] },
  },
  {
    id: 'R32-11', stage: 'round_of_32', position: 11,
    slot1: { label: '2K',            groups: ['K'] },
    slot2: { label: '2L',            groups: ['L'] },
  },
  {
    id: 'R32-12', stage: 'round_of_32', position: 12,
    slot1: { label: '1H',            groups: ['H'] },
    slot2: { label: '2J',            groups: ['J'] },
  },
  {
    id: 'R32-13', stage: 'round_of_32', position: 13,
    slot1: { label: '1B',            groups: ['B'] },
    slot2: { label: '3ro E/F/G/I/J', groups: ['E','F','G','I','J'] },
  },
  {
    id: 'R32-14', stage: 'round_of_32', position: 14,
    slot1: { label: '1J',            groups: ['J'] },
    slot2: { label: '2H',            groups: ['H'] },
  },
  {
    id: 'R32-15', stage: 'round_of_32', position: 15,
    slot1: { label: '1K',            groups: ['K'] },
    slot2: { label: '3ro D/E/I/J/L', groups: ['D','E','I','J','L'] },
  },
  {
    id: 'R32-16', stage: 'round_of_32', position: 16,
    slot1: { label: '2D',            groups: ['D'] },
    slot2: { label: '2G',            groups: ['G'] },
  },

  // ── Round of 16 (8 matches) — feeds from pairs of R32 ─────────────────
  { id: 'R16-1', stage: 'round_of_16',   position: 1, feedsFrom: [1,  2]  },
  { id: 'R16-2', stage: 'round_of_16',   position: 2, feedsFrom: [3,  4]  },
  { id: 'R16-3', stage: 'round_of_16',   position: 3, feedsFrom: [5,  6]  },
  { id: 'R16-4', stage: 'round_of_16',   position: 4, feedsFrom: [7,  8]  },
  { id: 'R16-5', stage: 'round_of_16',   position: 5, feedsFrom: [9,  10] },
  { id: 'R16-6', stage: 'round_of_16',   position: 6, feedsFrom: [11, 12] },
  { id: 'R16-7', stage: 'round_of_16',   position: 7, feedsFrom: [13, 14] },
  { id: 'R16-8', stage: 'round_of_16',   position: 8, feedsFrom: [15, 16] },

  // ── Quarter-finals (4 matches) — feeds from pairs of R16 ──────────────
  { id: 'QF-1', stage: 'quarter_final',  position: 1, feedsFrom: [1, 2] },
  { id: 'QF-2', stage: 'quarter_final',  position: 2, feedsFrom: [3, 4] },
  { id: 'QF-3', stage: 'quarter_final',  position: 3, feedsFrom: [5, 6] },
  { id: 'QF-4', stage: 'quarter_final',  position: 4, feedsFrom: [7, 8] },

  // ── Semi-finals (2 matches) — feeds from pairs of QF ─────────────────
  { id: 'SF-1', stage: 'semi_final',     position: 1, feedsFrom: [1, 2] },
  { id: 'SF-2', stage: 'semi_final',     position: 2, feedsFrom: [3, 4] },

  // ── Final ──────────────────────────────────────────────────────────────
  { id: 'F-1',  stage: 'final',          position: 1, feedsFrom: [1, 2] },
]
