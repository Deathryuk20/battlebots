import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

const ROUNDS = ['Qualifiers', 'Quarter-Finals', 'Semi-Finals', 'Finals']

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [round, setRound] = useState('all')

  useEffect(() => {
    load()
    const channel = supabase
      .channel('matches_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: true })
    setMatches(data || [])
    setLoading(false)
  }

  const filtered = round === 'all' ? matches : matches.filter(m => m.round === round)

  const liveMatches = matches.filter(m => m.status === 'live')

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Loading matches...</span>
    </div>
  )

  return (
    <div className="section" style={{ maxWidth: 900 }}>
      <div className="section-header">
        <p className="section-tag">Tournament Bracket</p>
        <h1 className="section-title">MATCHES</h1>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="badge badge-live">🔴 LIVE</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 1 }}>HAPPENING NOW</span>
          </div>
          {liveMatches.map(m => (
            <MatchCard key={m.id} match={m} highlight />
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="tabs">
        <button className={`tab ${round === 'all' ? 'active' : ''}`} onClick={() => setRound('all')}>All Rounds</button>
        {ROUNDS.map(r => (
          <button key={r} className={`tab ${round === r ? 'active' : ''}`} onClick={() => setRound(r)}>
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No matches scheduled yet. Check back soon.
        </div>
      ) : (
        <>
          {/* Group by round */}
          {(round === 'all' ? ROUNDS : [round]).map(r => {
            const roundMatches = filtered.filter(m => m.round === r)
            if (!roundMatches.length) return null
            return (
              <div key={r} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ height: 1, flex: 1, background: 'var(--border2)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: 'var(--text-dim)' }}>
                    {r.toUpperCase()}
                  </span>
                  <div style={{ height: 1, flex: 1, background: 'var(--border2)' }} />
                </div>
                {roundMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            )
          })}
        </>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
        {[
          { label: 'Total Matches', value: matches.length, color: 'var(--text)' },
          { label: 'Completed', value: matches.filter(m => m.status === 'completed').length, color: 'var(--green)' },
          { label: 'Upcoming', value: matches.filter(m => m.status === 'scheduled').length, color: 'var(--cyan)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchCard({ match: m, highlight }) {
  const isLive = m.status === 'live'
  const isCompleted = m.status === 'completed'

  return (
    <div className={`match-card ${isLive ? 'live-match' : ''}`} style={highlight ? { marginBottom: '1rem' } : {}}>
      <div className="match-header">
        <span className="match-round">{m.arena}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isLive && <span className="badge badge-live">🔴 LIVE</span>}
          {isCompleted && <span className="badge badge-ended">COMPLETED</span>}
          {m.status === 'scheduled' && <span className="badge badge-upcoming">SCHEDULED</span>}
        </div>
      </div>

      <div className="match-teams">
        <div className={`match-team ${isCompleted && m.winner_id === m.team_a_id ? 'winner' : ''}`}>
          <div className="match-team-name">{m.team_a_name}</div>
          {isCompleted && m.winner_id === m.team_a_id && (
            <div style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>WINNER 🏆</div>
          )}
        </div>
        <div className="match-vs">VS</div>
        <div className={`match-team ${isCompleted && m.winner_id === m.team_b_id ? 'winner' : ''}`}>
          <div className="match-team-name">{m.team_b_name}</div>
          {isCompleted && m.winner_id === m.team_b_id && (
            <div style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>WINNER 🏆</div>
          )}
        </div>
      </div>

      <div className="match-footer">
        <span>
          {m.scheduled_at
            ? format(new Date(m.scheduled_at), 'MMM d, yyyy · h:mm a')
            : 'Time TBD'
          }
        </span>
        <span>{m.round}</span>
      </div>
      {m.notes && (
        <div style={{ marginTop: 8, padding: '0.5rem 0.75rem', background: 'var(--bg2)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          {m.notes}
        </div>
      )}
    </div>
  )
}
