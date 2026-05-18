'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircle2, Radio, Clock, ChevronDown, ChevronUp,
  Mail, Users, Trophy, Crown, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { setMatchLive, scoreGroupMatch, scoreKnockoutMatch, sendInvitation } from './actions'
import type { Match } from '@/types'

// ── Helpers ───────────────────────────────────────────────────

const STAGE_LABEL: Record<string, string> = {
  group: 'Grupos', round_of_32: 'R32', round_of_16: 'Octavos',
  quarter_final: 'Cuartos', semi_final: 'Semifinal', final: 'Final',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function ScoreInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled: boolean
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      disabled={disabled}
      className="w-10 h-10 text-center text-lg font-bold bg-white/10 border border-white/15
                 rounded-xl text-white focus:outline-none focus:border-amber-500/60
                 disabled:opacity-40 transition"
    />
  )
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'finished') return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Puntuado</span>
  if (status === 'live')     return <span className="flex items-center gap-1 text-xs text-red-400 animate-pulse"><Radio className="w-3.5 h-3.5" /> En vivo</span>
  return <span className="flex items-center gap-1 text-xs text-white/40"><Clock className="w-3.5 h-3.5" /> Pendiente</span>
}

// ── GroupMatchCard ────────────────────────────────────────────

function GroupMatchCard({ match, scored, onScored }: {
  match: Match; scored: boolean; onScored: (id: number) => void
}) {
  const [home, setHome]    = useState(match.score_home?.toString() ?? '')
  const [away, setAway]    = useState(match.score_away?.toString() ?? '')
  const [error, setError]  = useState('')
  const [isPending, start] = useTransition()
  const isFinished = scored || match.status === 'finished'
  const isDisabled = isPending || isFinished

  return (
    <div className={cn('glass rounded-2xl p-4 transition-all', isFinished && 'opacity-60')}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Grupo {match.group_id}</span>
          <p className="text-[11px] text-white/30 mt-0.5">{formatDate(match.scheduled_at)}</p>
          {match.venue && <p className="text-[10px] text-white/20 truncate max-w-[200px]">{match.venue}</p>}
        </div>
        <StatusBadge status={isFinished ? 'finished' : match.status} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-sm font-semibold text-white text-right truncate">{match.home_team}</span>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreInput value={home} onChange={setHome} disabled={isDisabled} />
          <span className="text-white/30 font-bold">:</span>
          <ScoreInput value={away} onChange={setAway} disabled={isDisabled} />
        </div>
        <span className="flex-1 text-sm font-semibold text-white truncate">{match.away_team}</span>
      </div>
      {!isFinished && (
        <div className="flex items-center gap-2 mt-4">
          {match.status === 'scheduled' && (
            <button
              onClick={() => start(async () => { try { await setMatchLive(match.id) } catch (e) { setError(String(e)) } })}
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-400 active:scale-95 transition disabled:opacity-50"
            >▷ En vivo</button>
          )}
          <button
            onClick={() => {
              const h = parseInt(home), a = parseInt(away)
              if (isNaN(h) || isNaN(a)) { setError('Ingresa ambos marcadores'); return }
              setError('')
              start(async () => {
                try { await scoreGroupMatch(match.id, h, a); onScored(match.id) }
                catch (e) { setError(String(e)) }
              })
            }}
            disabled={isDisabled}
            className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 active:scale-95 transition disabled:opacity-50"
          >{isPending ? 'Puntuando…' : '✓ Puntuar'}</button>
        </div>
      )}
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
    </div>
  )
}

// ── KnockoutMatchCard ─────────────────────────────────────────

function KnockoutMatchCard({ match, scored, onScored }: {
  match: Match; scored: boolean; onScored: (id: number) => void
}) {
  const [home, setHome]           = useState(match.score_home?.toString() ?? '')
  const [away, setAway]           = useState(match.score_away?.toString() ?? '')
  const [winnerId, setWinnerId]   = useState<number | null>(null)
  const [error, setError]         = useState('')
  const [isPending, start]        = useTransition()
  const isFinished = scored || match.status === 'finished'
  const isDisabled = isPending || isFinished

  return (
    <div className={cn('glass rounded-2xl p-4 border transition-all', isFinished ? 'border-white/5 opacity-60' : 'border-amber-500/20')}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-amber-400/70 uppercase tracking-widest">{STAGE_LABEL[match.stage]}</span>
          <p className="text-[11px] text-white/30 mt-0.5">{formatDate(match.scheduled_at)}</p>
          {match.venue && <p className="text-[10px] text-white/20 truncate max-w-[200px]">{match.venue}</p>}
        </div>
        <StatusBadge status={isFinished ? 'finished' : match.status} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-sm font-semibold text-white text-right truncate">{match.home_team}</span>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreInput value={home} onChange={setHome} disabled={isDisabled} />
          <span className="text-white/30 font-bold">:</span>
          <ScoreInput value={away} onChange={setAway} disabled={isDisabled} />
        </div>
        <span className="flex-1 text-sm font-semibold text-white truncate">{match.away_team}</span>
      </div>
      {!isFinished && (
        <>
          <div className="mt-3">
            <p className="text-[11px] text-white/30 mb-2">Equipo que avanza:</p>
            <div className="flex gap-2">
              {[{ id: match.home_team_id, name: match.home_team }, { id: match.away_team_id, name: match.away_team }].map(({ id, name }) => (
                <button key={id} disabled={isDisabled} onClick={() => id && setWinnerId(id)}
                  className={cn('flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition active:scale-95 disabled:opacity-50',
                    winnerId === id ? 'bg-amber-500/20 border-amber-500/60 text-amber-400' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25'
                  )}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {match.status === 'scheduled' && (
              <button onClick={() => start(async () => { try { await setMatchLive(match.id) } catch (e) { setError(String(e)) } })}
                disabled={isPending}
                className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-400 active:scale-95 transition disabled:opacity-50">
                ▷ En vivo
              </button>
            )}
            <button
              onClick={() => {
                const h = parseInt(home), a = parseInt(away)
                if (isNaN(h) || isNaN(a)) { setError('Ingresa marcadores'); return }
                if (!winnerId) { setError('Selecciona ganador'); return }
                setError('')
                start(async () => {
                  try { await scoreKnockoutMatch(match.id, h, a, winnerId); onScored(match.id) }
                  catch (e) { setError(String(e)) }
                })
              }}
              disabled={isDisabled}
              className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 active:scale-95 transition disabled:opacity-50">
              {isPending ? 'Puntuando…' : '✓ Puntuar'}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
    </div>
  )
}

// ── InvitationsTab ────────────────────────────────────────────

interface InvitationRow {
  id: string
  email: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}

function InvitationsTab({ invitations: initial }: { invitations: InvitationRow[] }) {
  const [email, setEmail]         = useState('')
  const [sent, setSent]           = useState<string[]>([])
  const [error, setError]         = useState('')
  const [isPending, start]        = useTransition()

  function handleSend() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) { setError('Email inválido'); return }
    setError('')
    start(async () => {
      try {
        await sendInvitation(trimmed)
        setSent((prev) => [trimmed, ...prev])
        setEmail('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al enviar')
      }
    })
  }

  const allInvitations = [
    ...sent.map((e) => ({ id: e, email: e, accepted_at: null, expires_at: '', created_at: new Date().toISOString(), fresh: true })),
    ...initial.map((i) => ({ ...i, fresh: false })),
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Send form */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Invitar usuario
        </p>
        <p className="text-[11px] text-white/30">
          El usuario recibirá un email para crear su cuenta. El link expira en 7 días.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="correo@ejemplo.com"
            disabled={isPending}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !email.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {isPending ? '…' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>

      {/* List */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
          Historial ({allInvitations.length})
        </p>
        {allInvitations.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-8">No hay invitaciones enviadas.</p>
        ) : (
          <div className="space-y-2">
            {allInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-4 h-4 text-white/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{inv.email}</p>
                  <p className="text-[10px] text-white/30">
                    {new Date(inv.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  inv.accepted_at
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-white/5 text-white/30',
                )}>
                  {inv.accepted_at ? 'Aceptada' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PoolsTab ──────────────────────────────────────────────────

interface PoolRow {
  id: string
  name: string
  owner_id: string
  invite_code: string
  created_at: string
  member_count: number
  owner_username: string
}

function PoolsTab({ pools }: { pools: PoolRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-amber-400/60" />
        <div>
          <p className="text-sm font-bold text-white">{pools.length} quinielas activas</p>
          <p className="text-[11px] text-white/30">
            {pools.reduce((s, p) => s + p.member_count, 0)} participantes en total
          </p>
        </div>
      </div>

      {pools.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-8">No hay quinielas creadas aún.</p>
      ) : (
        <div className="space-y-2">
          {pools.map((pool) => (
            <div key={pool.id} className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Crown className="w-4 h-4 text-amber-500/50 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{pool.name}</p>
                <p className="text-[10px] text-white/30 font-mono">{pool.invite_code}</p>
                <p className="text-[10px] text-white/20 mt-0.5">Dueño: {pool.owner_username}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/40 shrink-0">
                <Users className="w-3.5 h-3.5" />
                {pool.member_count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────

interface Props {
  matches:     Match[]
  userCount:   number
  invitations: InvitationRow[]
  pools:       PoolRow[]
}

type Tab = 'invitations' | 'pools' | 'matches'

export function AdminDashboard({ matches, userCount, invitations, pools }: Props) {
  const [tab, setTab]             = useState<Tab>('invitations')
  const [showFinished, setShowFinished] = useState(false)
  const [scoredIds, setScoredIds] = useState<Set<number>>(new Set())
  const [matchTab, setMatchTab]   = useState<'groups' | 'knockout'>('groups')

  function markScored(id: number) { setScoredIds((p) => new Set(p).add(id)) }

  const groupMatches    = matches.filter((m) => m.stage === 'group')
  const knockoutMatches = matches.filter((m) => m.stage !== 'group')
  const finishedCount   = matches.filter((m) => m.status === 'finished' || scoredIds.has(m.id)).length
  const pendingGroups   = groupMatches.filter((m) => m.status !== 'finished' && !scoredIds.has(m.id))
  const finishedGroups  = groupMatches.filter((m) => m.status === 'finished' || scoredIds.has(m.id))

  const TABS: { key: Tab; label: string }[] = [
    { key: 'invitations', label: 'Invitaciones' },
    { key: 'pools',       label: 'Quinielas' },
    { key: 'matches',     label: 'Partidos' },
  ]

  return (
    <div className="flex flex-col gap-5 px-4 pb-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Usuarios',   value: userCount },
          { label: 'Quinielas',  value: pools.length },
          { label: `${finishedCount}/${matches.length}`, value: '', label2: 'Puntuados' },
        ].map(({ label, value, label2 }) => (
          <div key={label} className="glass rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-white">{value || label}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{label2 ?? label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-2xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
              tab === key ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Invitations ── */}
      {tab === 'invitations' && <InvitationsTab invitations={invitations} />}

      {/* ── Pools ── */}
      {tab === 'pools' && <PoolsTab pools={pools} />}

      {/* ── Matches / scoring ── */}
      {tab === 'matches' && (
        <>
          <div className="flex gap-2 glass rounded-2xl p-1">
            {(['groups', 'knockout'] as const).map((t) => (
              <button key={t} onClick={() => setMatchTab(t)}
                className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all', matchTab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60')}>
                {t === 'groups' ? 'Fase de Grupos' : 'Eliminatoria'}
              </button>
            ))}
          </div>

          {matchTab === 'groups' && (
            <div className="flex flex-col gap-3">
              {pendingGroups.length === 0
                ? <p className="text-center text-sm text-white/30 py-8">No hay partidos pendientes</p>
                : pendingGroups.map((m) => <GroupMatchCard key={m.id} match={m} scored={scoredIds.has(m.id)} onScored={markScored} />)
              }
              {finishedGroups.length > 0 && (
                <>
                  <button onClick={() => setShowFinished((v) => !v)}
                    className="flex items-center justify-between glass rounded-2xl px-4 py-3 text-sm text-white/50 hover:text-white/80 transition">
                    <span>Finalizados ({finishedGroups.length})</span>
                    {showFinished ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showFinished && <div className="flex flex-col gap-3">
                    {finishedGroups.map((m) => <GroupMatchCard key={m.id} match={m} scored={scoredIds.has(m.id)} onScored={markScored} />)}
                  </div>}
                </>
              )}
            </div>
          )}

          {matchTab === 'knockout' && (
            <div className="flex flex-col gap-4">
              {knockoutMatches.length === 0
                ? <div className="glass rounded-2xl p-8 text-center"><p className="text-sm text-white/30">Los partidos de eliminatoria se agregarán al finalizar la fase de grupos.</p></div>
                : knockoutMatches.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .map((m) => <KnockoutMatchCard key={m.id} match={m} scored={scoredIds.has(m.id)} onScored={markScored} />)
              }
            </div>
          )}
        </>
      )}
    </div>
  )
}
