import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  Weapon: '⚔️', Armor: '🛡️', 'Drive System': '⚙️', Electronics: '🔋', Special: '✨'
}
const CATEGORY_COLORS = {
  Weapon: 'var(--red)', Armor: 'var(--cyan)', 'Drive System': 'var(--orange)',
  Electronics: 'var(--yellow)', Special: 'var(--purple)'
}

function Timer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    if (!endsAt) return
    const tick = () => {
      const diff = new Date(endsAt) - new Date()
      if (diff <= 0) { setTimeLeft('ENDED'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setUrgent(diff < 60000)
      setTimeLeft(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [endsAt])

  return (
    <div className="auction-timer" style={urgent ? { color: 'var(--red)', animation: 'pulseBadge 0.8s ease infinite' } : {}}>
      ⏱ {timeLeft || '--:--'}
    </div>
  )
}

export default function Auction() {
  const [items, setItems] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [bidAmounts, setBidAmounts] = useState({})
  const [bidding, setBidding] = useState({})

  const load = useCallback(async () => {
    const [itemsRes, teamsRes] = await Promise.all([
      supabase.from('auction_items').select('*').order('status').order('created_at'),
      supabase.from('teams').select('id, team_name, points').eq('status', 'approved').order('team_name'),
    ])
    setItems(itemsRes.data || [])
    setTeams(teamsRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Real-time subscription
    const channel = supabase
      .channel('auction_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_items' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const currentTeam = teams.find(t => t.id === selectedTeam)

  const placeBid = async (item) => {
    if (!selectedTeam) { toast.error('Select your team first!'); return }
    const amount = parseInt(bidAmounts[item.id])
    if (!amount || isNaN(amount)) { toast.error('Enter a valid bid amount'); return }
    const minBid = (item.current_bid || item.starting_bid) + item.min_increment
    if (amount < minBid) { toast.error(`Minimum bid is ${minBid} pts`); return }
    if (!currentTeam) return
    if (amount > currentTeam.points) { toast.error(`Not enough points! You have ${currentTeam.points} pts`); return }
    if (item.current_bidder_id === selectedTeam) { toast.error("You're already the highest bidder!"); return }

    setBidding(b => ({ ...b, [item.id]: true }))
    try {
      // Record bid
      await supabase.from('bids').insert([{
        item_id: item.id,
        team_id: selectedTeam,
        team_name: currentTeam.team_name,
        amount,
      }])
      // Update item
      await supabase.from('auction_items').update({
        current_bid: amount,
        current_bidder_id: selectedTeam,
        current_bidder_name: currentTeam.team_name,
      }).eq('id', item.id)
      // Deduct points (simplified - refund previous bidder in real impl)
      await supabase.from('teams').update({ points: currentTeam.points - amount }).eq('id', selectedTeam)

      toast.success(`Bid of ${amount} pts placed on ${item.name}!`)
      setBidAmounts(a => ({ ...a, [item.id]: '' }))
      load()
    } catch {
      toast.error('Bid failed. Try again.')
    } finally {
      setBidding(b => ({ ...b, [item.id]: false }))
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i =>
    filter === 'active' ? i.status === 'active' :
    filter === 'upcoming' ? i.status === 'upcoming' :
    filter === 'ended' ? i.status === 'ended' : true
  )

  const statusCounts = {
    active: items.filter(i => i.status === 'active').length,
    upcoming: items.filter(i => i.status === 'upcoming').length,
    ended: items.filter(i => i.status === 'ended').length,
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Loading auction...</span>
    </div>
  )

  return (
    <div className="section" style={{ maxWidth: 1100 }}>
      <div className="section-header">
        <p className="section-tag">Component Marketplace</p>
        <h1 className="section-title">AUCTION HOUSE</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.75rem' }}>
          Bid strategically with your team's points. Once spent, they're gone.
        </p>
      </div>

      {/* Team selector + points display */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="form-label" style={{ marginBottom: 6 }}>Your Team</label>
          <select className="form-input" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option value="">— Select your team to bid —</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.team_name} ({t.points} pts)</option>
            ))}
          </select>
        </div>
        {currentTeam && (
          <div style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '0.75rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>AVAILABLE POINTS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--cyan)' }}>{currentTeam.points}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([s, c]) => (
            <div key={s} className={`badge badge-${s}`}>{c} {s}</div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {['all', 'active', 'upcoming', 'ended'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Items' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${statusCounts[f] || 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No items in this category yet.
        </div>
      ) : (
        <div className="auction-grid">
          {filtered.map(item => {
            const currentBid = item.current_bid || item.starting_bid
            const minNext = currentBid + item.min_increment
            const isActive = item.status === 'active'
            const isWinning = item.current_bidder_id === selectedTeam

            return (
              <div key={item.id} className={`auction-card ${item.status}`}>
                <div className="auction-img">
                  <span style={{ fontSize: 80 }}>{CATEGORY_ICONS[item.category] || '📦'}</span>
                  <div className="auction-category-badge">
                    <span className="badge" style={{
                      background: `${CATEGORY_COLORS[item.category]}15`,
                      color: CATEGORY_COLORS[item.category],
                      border: `1px solid ${CATEGORY_COLORS[item.category]}40`
                    }}>
                      {item.category}
                    </span>
                  </div>
                  {isWinning && isActive && (
                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                      <span className="badge badge-approved">🏆 WINNING</span>
                    </div>
                  )}
                </div>
                <div className="auction-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 className="auction-name">{item.name}</h3>
                    <span className={`badge badge-${item.status}`}>{item.status.toUpperCase()}</span>
                  </div>
                  <p className="auction-desc">{item.description}</p>

                  <div className="auction-bid-info">
                    <div>
                      <div className="bid-label">{item.current_bid ? 'CURRENT BID' : 'STARTING BID'}</div>
                      <div className="bid-amount">{currentBid}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}> pts</span></div>
                      {item.current_bidder_name && (
                        <div className="bidder-name">by {item.current_bidder_name}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="bid-label">MIN INCREMENT</div>
                      <div className="bid-amount-sm">+{item.min_increment} pts</div>
                    </div>
                  </div>

                  {isActive && item.ends_at && <Timer endsAt={item.ends_at} />}

                  {isActive && (
                    <div className="bid-input-row">
                      <input
                        className="form-input"
                        type="number"
                        placeholder={`Min: ${minNext} pts`}
                        value={bidAmounts[item.id] || ''}
                        onChange={e => setBidAmounts(a => ({ ...a, [item.id]: e.target.value }))}
                        min={minNext}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => placeBid(item)}
                        disabled={bidding[item.id] || !selectedTeam}
                        style={{ flexShrink: 0 }}
                      >
                        {bidding[item.id] ? <div className="spinner" /> : '⚡ BID'}
                      </button>
                    </div>
                  )}

                  {item.status === 'ended' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg2)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {item.current_bidder_name
                        ? <span style={{ color: 'var(--green)' }}>🏆 Won by {item.current_bidder_name}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>No bids placed</span>
                      }
                    </div>
                  )}

                  {item.status === 'upcoming' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)' }}>
                      📅 Bidding opens soon
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
