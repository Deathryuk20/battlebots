import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [wc, setWc] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('status', 'approved')
      .order('team_name')
    setTeams(data || [])
    setLoading(false)
  }

  const weightClasses = [...new Set(teams.map(t => t.bot_weight_class))].filter(Boolean)

  const filtered = teams.filter(t => {
    const matchSearch = !search || t.team_name.toLowerCase().includes(search.toLowerCase()) ||
      t.bot_name.toLowerCase().includes(search.toLowerCase()) ||
      t.college.toLowerCase().includes(search.toLowerCase())
    const matchWc = wc === 'all' || t.bot_weight_class === wc
    return matchSearch && matchWc
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Loading teams...</span>
    </div>
  )

  return (
    <div className="section" style={{ maxWidth: 1100 }}>
      <div className="section-header">
        <p className="section-tag">Competitors</p>
        <h1 className="section-title">TEAMS DIRECTORY</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.75rem' }}>
          {teams.length} approved teams ready to compete.
        </p>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="🔍 Search teams, bots, colleges..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="form-input" value={wc} onChange={e => setWc(e.target.value)} style={{ width: 200 }}>
          <option value="all">All Weight Classes</option>
          {weightClasses.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No teams found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(team => (
            <div
              key={team.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(team)}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div
                  className="team-avatar"
                  style={{ background: team.avatar_color, width: 52, height: 52, fontSize: 22, flexShrink: 0 }}
                >
                  {team.bot_name?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team.team_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{team.bot_name}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="badge badge-upcoming" style={{ fontSize: 9 }}>{team.bot_weight_class}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: '1rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                🏫 {team.college}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border2)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green)' }}>{team.wins}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WINS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--red)' }}>{team.losses}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LOSSES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cyan)' }}>{team.points}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POINTS</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="team-avatar" style={{ background: selected.avatar_color, width: 56, height: 56, fontSize: 24 }}>
                  {selected.bot_name?.[0]}
                </div>
                <div>
                  <div className="modal-title">{selected.team_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{selected.bot_name}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Captain', value: selected.captain_name },
                  { label: 'College', value: selected.college },
                  { label: 'Weight Class', value: selected.bot_weight_class },
                  { label: 'Phone', value: selected.phone },
                ].map((f, i) => (
                  <div key={i} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontWeight: 600 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {selected.members?.filter(m => m).length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TEAM MEMBERS</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selected.members.filter(m => m).map((m, i) => (
                      <span key={i} className="badge badge-pending">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { label: 'Wins', value: selected.wins, color: 'var(--green)' },
                  { label: 'Losses', value: selected.losses, color: 'var(--red)' },
                  { label: 'Points', value: selected.points, color: 'var(--cyan)' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: s.color }}>{s.value}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
