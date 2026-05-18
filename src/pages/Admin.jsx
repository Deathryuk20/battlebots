import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_PASSWORD = 'battlebots2025' // Change this!

const AUCTION_CATEGORIES = ['Weapon', 'Armor', 'Drive System', 'Electronics', 'Special']
const WEIGHT_CLASSES = ['Featherweight', 'Lightweight', 'Middleweight', 'Heavyweight']

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('bb_admin') === 'yes')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('teams')

  if (!authed) return <AdminLogin password={password} setPassword={setPassword} onLogin={(p) => {
    if (p === ADMIN_PASSWORD) {
      sessionStorage.setItem('bb_admin', 'yes')
      setAuthed(true)
      toast.success('Welcome, Admin!')
    } else {
      toast.error('Wrong password.')
    }
  }} />

  return (
    <div className="section" style={{ maxWidth: 1100 }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="section-tag">Control Center</p>
          <h1 className="section-title">ADMIN PANEL</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { sessionStorage.removeItem('bb_admin'); setAuthed(false) }}>
          🔒 Logout
        </button>
      </div>

      <div className="tabs">
        {[['teams', '🤖 Teams'], ['auction', '💰 Auction'], ['matches', '⚔️ Matches'], ['announcements', '📣 Announcements']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'teams' && <TeamsAdmin />}
      {tab === 'auction' && <AuctionAdmin />}
      {tab === 'matches' && <MatchesAdmin />}
      {tab === 'announcements' && <AnnouncementsAdmin />}
    </div>
  )
}

function AdminLogin({ password, setPassword, onLogin }) {
  return (
    <div className="admin-login">
      <div className="card admin-login-card" style={{ padding: '2.5rem' }}>
        <div className="admin-lock">🔐</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, marginBottom: '0.5rem' }}>ADMIN ACCESS</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: 14 }}>Restricted to event administrators only.</p>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Admin Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin(password)}
          />
        </div>
        <button className="btn btn-primary w-full" onClick={() => onLogin(password)}>
          🔓 AUTHENTICATE
        </button>
      </div>
    </div>
  )
}

// ── TEAMS ADMIN ──────────────────────────────────────────────
function TeamsAdmin() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('teams').select('*').order('created_at', { ascending: false })
    setTeams(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('teams').update({ status }).eq('id', id)
    toast.success(`Team ${status}!`)
    load()
  }

  async function updatePoints(id, points) {
    const p = parseInt(points)
    if (isNaN(p)) return
    await supabase.from('teams').update({ points: p }).eq('id', id)
    toast.success('Points updated!')
    load()
  }

  async function updateWins(id, wins, losses) {
    await supabase.from('teams').update({ wins, losses }).eq('id', id)
    toast.success('Record updated!')
    load()
  }

  const filtered = filter === 'all' ? teams : teams.filter(t => t.status === filter)
  const counts = { pending: teams.filter(t => t.status === 'pending').length, approved: teams.filter(t => t.status === 'approved').length, rejected: teams.filter(t => t.status === 'rejected').length }

  if (loading) return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem', color: 'var(--text-dim)' }}><div className="spinner" /> Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
        </div>
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {filtered.map(team => (
        <div key={team.id} className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="team-avatar" style={{ background: team.avatar_color, flexShrink: 0 }}>
              {team.bot_name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <strong style={{ fontSize: 16 }}>{team.team_name}</strong>
                <span className={`badge badge-${team.status}`}>{team.status}</span>
                <span className="badge badge-upcoming" style={{ fontSize: 9 }}>{team.bot_weight_class}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                🤖 {team.bot_name} · 👤 {team.captain_name} · 🏫 {team.college}<br/>
                📧 {team.captain_email} · 📞 {team.phone}
              </div>
              {team.members?.filter(m => m).length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {team.members.filter(m => m).map((m, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--bg2)', color: 'var(--text-dim)', border: '1px solid var(--border2)', fontSize: 10 }}>{m}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Points editor */}
              <input
                className="form-input"
                type="number"
                defaultValue={team.points}
                style={{ width: 90 }}
                onBlur={e => updatePoints(team.id, e.target.value)}
                title="Points"
              />
              {/* W/L editor */}
              <input
                className="form-input"
                type="number"
                defaultValue={team.wins}
                style={{ width: 60 }}
                placeholder="W"
                onBlur={e => updateWins(team.id, parseInt(e.target.value) || 0, team.losses)}
                title="Wins"
              />
              <input
                className="form-input"
                type="number"
                defaultValue={team.losses}
                style={{ width: 60 }}
                placeholder="L"
                onBlur={e => updateWins(team.id, team.wins, parseInt(e.target.value) || 0)}
                title="Losses"
              />
              {team.status === 'pending' && (
                <>
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(team.id, 'approved')}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(team.id, 'rejected')}>✗ Reject</button>
                </>
              )}
              {team.status === 'approved' && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(team.id, 'rejected')}>Reject</button>
              )}
              {team.status === 'rejected' && (
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(team.id, 'approved')}>Approve</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── AUCTION ADMIN ─────────────────────────────────────────────
function AuctionAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: 'Weapon', starting_bid: 50, min_increment: 10, status: 'upcoming', ends_at: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('auction_items').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function addItem() {
    if (!form.name.trim()) { toast.error('Item name required'); return }
    const { error } = await supabase.from('auction_items').insert([{
      ...form,
      starting_bid: parseInt(form.starting_bid) || 50,
      min_increment: parseInt(form.min_increment) || 10,
      ends_at: form.ends_at || null,
    }])
    if (error) { toast.error('Failed to add item'); return }
    toast.success('Item added!')
    setShowForm(false)
    setForm({ name: '', description: '', category: 'Weapon', starting_bid: 50, min_increment: 10, status: 'upcoming', ends_at: '' })
    load()
  }

  async function updateStatus(id, status) {
    await supabase.from('auction_items').update({ status }).eq('id', id)
    toast.success('Status updated!')
    load()
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return
    await supabase.from('auction_items').delete().eq('id', id)
    toast.success('Item deleted.')
    load()
  }

  if (loading) return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem', color: 'var(--text-dim)' }}><div className="spinner" /> Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Auction Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: '1.25rem', color: 'var(--orange)' }}>NEW ITEM</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Titanium Blade" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {AUCTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the item..." />
            </div>
            <div className="form-group">
              <label className="form-label">Starting Bid (pts)</label>
              <input className="form-input" type="number" value={form.starting_bid} onChange={e => setForm(f => ({ ...f, starting_bid: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Increment (pts)</label>
              <input className="form-input" type="number" value={form.min_increment} onChange={e => setForm(f => ({ ...f, min_increment: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">End Time (optional)</label>
              <input className="form-input" type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={addItem}>⚡ Add Item</button>
          </div>
        </div>
      )}

      {items.map(item => (
        <div key={item.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 32 }}>
              {['Weapon','Armor','Drive System','Electronics','Special'].includes(item.category)
                ? { Weapon: '⚔️', Armor: '🛡️', 'Drive System': '⚙️', Electronics: '🔋', Special: '✨' }[item.category]
                : '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontWeight: 700 }}>{item.name} <span className={`badge badge-${item.status}`} style={{ marginLeft: 8 }}>{item.status}</span></div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.category} · Start: {item.starting_bid}pts · Min+{item.min_increment}pts</div>
              {item.current_bid && <div style={{ fontSize: 12, color: 'var(--cyan)' }}>Current: {item.current_bid}pts by {item.current_bidder_name}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {item.status !== 'active' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(item.id, 'active')}>▶ Activate</button>}
              {item.status !== 'ended' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(item.id, 'ended')}>⏹ End</button>}
              {item.status !== 'upcoming' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(item.id, 'upcoming')}>↺ Reset</button>}
              <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── MATCHES ADMIN ─────────────────────────────────────────────
function MatchesAdmin() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ team_a_id: '', team_b_id: '', round: 'Qualifiers', scheduled_at: '', arena: 'Arena Alpha', notes: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const [m, t] = await Promise.all([
      supabase.from('matches').select('*').order('scheduled_at'),
      supabase.from('teams').select('id, team_name').eq('status', 'approved').order('team_name'),
    ])
    setMatches(m.data || [])
    setTeams(t.data || [])
    setLoading(false)
  }

  async function addMatch() {
    const ta = teams.find(t => t.id === form.team_a_id)
    const tb = teams.find(t => t.id === form.team_b_id)
    if (!ta || !tb) { toast.error('Select both teams'); return }
    if (ta.id === tb.id) { toast.error('Teams must be different'); return }
    await supabase.from('matches').insert([{
      team_a_id: form.team_a_id, team_b_id: form.team_b_id,
      team_a_name: ta.team_name, team_b_name: tb.team_name,
      round: form.round, scheduled_at: form.scheduled_at || null,
      arena: form.arena, notes: form.notes, status: 'scheduled',
    }])
    toast.success('Match scheduled!')
    setShowForm(false)
    load()
  }

  async function setWinner(match, winnerId) {
    const winnerName = winnerId === match.team_a_id ? match.team_a_name : match.team_b_name
    const loserId = winnerId === match.team_a_id ? match.team_b_id : match.team_a_id
    await supabase.from('matches').update({ winner_id: winnerId, winner_name: winnerName, status: 'completed' }).eq('id', match.id)
    // Update wins/losses
    await supabase.rpc ? null : null // Simple approach:
    const winner = await supabase.from('teams').select('wins').eq('id', winnerId).single()
    const loser = await supabase.from('teams').select('losses').eq('id', loserId).single()
    if (winner.data) await supabase.from('teams').update({ wins: (winner.data.wins || 0) + 1 }).eq('id', winnerId)
    if (loser.data) await supabase.from('teams').update({ losses: (loser.data.losses || 0) + 1 }).eq('id', loserId)
    toast.success(`${winnerName} marked as winner!`)
    load()
  }

  async function setLive(id) {
    await supabase.from('matches').update({ status: 'live' }).eq('id', id)
    toast.success('Match is now LIVE!')
    load()
  }

  async function deleteMatch(id) {
    if (!confirm('Delete this match?')) return
    await supabase.from('matches').delete().eq('id', id)
    toast.success('Match deleted.')
    load()
  }

  if (loading) return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem', color: 'var(--text-dim)' }}><div className="spinner" /> Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Schedule Match'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: '1.25rem', color: 'var(--red)' }}>NEW MATCH</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Team A</label>
              <select className="form-input" value={form.team_a_id} onChange={e => setForm(f => ({ ...f, team_a_id: e.target.value }))}>
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team B</label>
              <select className="form-input" value={form.team_b_id} onChange={e => setForm(f => ({ ...f, team_b_id: e.target.value }))}>
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Round</label>
              <select className="form-input" value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))}>
                {['Qualifiers','Quarter-Finals','Semi-Finals','Finals'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Arena</label>
              <input className="form-input" value={form.arena} onChange={e => setForm(f => ({ ...f, arena: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={addMatch}>⚔️ Schedule Match</button>
          </div>
        </div>
      )}

      {matches.map(m => (
        <div key={m.id} className={`card ${m.status === 'live' ? 'card-glow' : ''}`} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 1 }}>
                {m.team_a_name} <span style={{ color: 'var(--red)' }}>vs</span> {m.team_b_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {m.round} · {m.arena}
                {m.winner_name && <span style={{ color: 'var(--green)', marginLeft: 8 }}>🏆 {m.winner_name}</span>}
              </div>
            </div>
            <span className={`badge badge-${m.status}`}>{m.status}</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {m.status === 'scheduled' && <button className="btn btn-danger btn-sm" onClick={() => setLive(m.id)}>🔴 Go Live</button>}
              {m.status === 'live' && (
                <>
                  <button className="btn btn-success btn-sm" onClick={() => setWinner(m, m.team_a_id)}>🏆 {m.team_a_name}</button>
                  <button className="btn btn-success btn-sm" onClick={() => setWinner(m, m.team_b_id)}>🏆 {m.team_b_name}</button>
                </>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => deleteMatch(m.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ANNOUNCEMENTS ADMIN ───────────────────────────────────────
function AnnouncementsAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', type: 'info', pinned: false })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function add() {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return }
    await supabase.from('announcements').insert([form])
    toast.success('Announcement posted!')
    setShowForm(false)
    setForm({ title: '', content: '', type: 'info', pinned: false })
    load()
  }

  async function del(id) {
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Deleted.')
    load()
  }

  const typeIcons = { info: 'ℹ️', warning: '⚠️', success: '✅', danger: '🚨' }

  if (loading) return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem', color: 'var(--text-dim)' }}><div className="spinner" /> Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Post Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: '1.25rem', color: 'var(--yellow)' }}>NEW ANNOUNCEMENT</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title..." />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-input" rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Announcement details..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['info','warning','success','danger'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--red)' }} />
                <label htmlFor="pinned" className="form-label" style={{ margin: 0 }}>Pin to top</label>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={add}>📣 Post</button>
          </div>
        </div>
      )}

      {items.map(item => (
        <div key={item.id} className={`announcement ${item.type}`} style={{ position: 'relative' }}>
          <div className="announcement-icon">{typeIcons[item.type]}</div>
          <div style={{ flex: 1 }}>
            <div className="announcement-title">{item.title} {item.pinned && '📌'}</div>
            <div className="announcement-content">{item.content}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => del(item.id)}>🗑</button>
        </div>
      ))}
    </div>
  )
}
