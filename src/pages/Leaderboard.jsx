import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('status', 'approved')
      .order('wins', { ascending: false })
      .order('points', { ascending: false })
    setTeams(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? teams : teams.filter(t => t.bot_weight_class === filter)

  const weightClasses = [...new Set(teams.map(t => t.bot_weight_class))].filter(Boolean)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Loading standings...</span>
    </div>
  )

  return (
    <div className="section" style={{ maxWidth: 900 }}>
      <div className="section-header">
        <p className="section-tag">Rankings</p>
        <h1 className="section-title">LEADERBOARD</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.75rem' }}>
          Teams ranked by wins, then remaining points.
        </p>
      </div>

      {/* Top 3 podium */}
      {filtered.length >= 3 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', alignItems: 'flex-end', justifyContent: 'center' }}>
          {[filtered[1], filtered[0], filtered[2]].map((team, i) => {
            const heights = ['140px', '180px', '120px']
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3

            return (
              <div key={team.id} style={{ flex: 1, maxWidth: 200, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {RANK_MEDALS[actualRank - 1]} #{actualRank}
                </div>
                <div
                  className="team-avatar"
                  style={{ background: team.avatar_color, margin: '0 auto 8px', width: 56, height: 56, fontSize: 24 }}
                >
                  {team.bot_name?.[0] || '?'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 1, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {team.team_name}
                </div>
                <div style={{
                  height: heights[i],
                  background: `linear-gradient(to top, ${team.avatar_color}30, ${team.avatar_color}08)`,
                  border: `1px solid ${team.avatar_color}40`,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 12,
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  color: team.avatar_color,
                }}>
                  {team.wins}W
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Classes</button>
        {weightClasses.map(wc => (
          <button key={wc} className={`tab ${filter === wc ? 'active' : ''}`} onClick={() => setFilter(wc)}>{wc}</button>
        ))}
      </div>

      {/* Leaderboard list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No approved teams yet.
        </div>
      ) : (
        filtered.map((team, i) => (
          <div key={team.id} className={`leaderboard-row rank-${i + 1}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="rank-num">
              {i < 3 ? RANK_MEDALS[i] : `#${i + 1}`}
            </div>
            <div className="team-avatar" style={{ background: team.avatar_color }}>
              {team.bot_name?.[0] || team.team_name?.[0]}
            </div>
            <div className="team-info">
              <div className="team-name-lb">{team.team_name}</div>
              <div className="team-college">{team.college} · {team.bot_name}</div>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-upcoming" style={{ fontSize: 9, padding: '2px 8px' }}>{team.bot_weight_class}</span>
              </div>
            </div>
            <div className="team-wl" style={{ textAlign: 'center', minWidth: 60 }}>
              <div className="wl-stat" style={{ color: 'var(--green)' }}>{team.wins}</div>
              <div className="wl-label">WINS</div>
            </div>
            <div className="team-wl" style={{ textAlign: 'center', minWidth: 60 }}>
              <div className="wl-stat" style={{ color: 'var(--red)' }}>{team.losses}</div>
              <div className="wl-label">LOSSES</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', marginBottom: 4 }}>POINTS</div>
              <div className="team-points-lb">{team.points}</div>
            </div>
          </div>
        ))
      )}

      {/* Stats cards */}
      {teams.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginTop: '3rem' }}>
          {[
            { label: 'Total Teams', value: teams.length, icon: '🤖' },
            { label: 'Total Wins', value: teams.reduce((a, t) => a + t.wins, 0), icon: '🏆' },
            { label: 'Avg Points', value: Math.round(teams.reduce((a, t) => a + t.points, 0) / teams.length), icon: '💰' },
            { label: 'Weight Classes', value: weightClasses.length, icon: '⚖️' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--orange)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
