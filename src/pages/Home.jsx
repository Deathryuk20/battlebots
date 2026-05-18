import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime({ d, h, m, s })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="countdown">
      {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([k, label], i) => (
        <>
          {i > 0 && <div className="countdown-sep">:</div>}
          <div className="countdown-unit" key={k}>
            <div className="countdown-num">{pad(time[k])}</div>
            <div className="countdown-label">{label}</div>
          </div>
        </>
      ))}
    </div>
  )
}

const features = [
  { icon: '🤖', title: 'Team Registration', desc: 'Register your bot with full specifications, team details, and weight class selection.' },
  { icon: '⚡', title: 'Live Auction', desc: 'Bid on exclusive components and power-ups using your team\'s allocated points.' },
  { icon: '🏆', title: 'Live Brackets', desc: 'Track every match in real-time from qualifiers to the championship final.' },
  { icon: '📊', title: 'Leaderboard', desc: 'See where your team stands in the overall rankings based on wins and performance.' },
  { icon: '📣', title: 'Announcements', desc: 'Stay updated with live announcements from the event administrators.' },
  { icon: '🎯', title: 'Weight Classes', desc: 'Compete in Featherweight, Lightweight, Middleweight, or Heavyweight divisions.' },
]

const BOT_EMOJIS = ['🤖', '⚙️', '🔩', '🦾', '🔧', '💀', '🛡️', '⚡']

export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [teamCount, setTeamCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [auctionCount, setAuctionCount] = useState(0)
  const [floatingBots, setFloatingBots] = useState([])

  useEffect(() => {
    loadData()
    setFloatingBots(Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: BOT_EMOJIS[i % BOT_EMOJIS.length],
      x: Math.random() * 90,
      y: Math.random() * 90,
      dur: 8 + Math.random() * 12,
      delay: Math.random() * -10,
      size: 20 + Math.random() * 20,
    })))
  }, [])

  async function loadData() {
    const [t, m, a, ann] = await Promise.all([
      supabase.from('teams').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabase.from('matches').select('id', { count: 'exact' }),
      supabase.from('auction_items').select('id', { count: 'exact' }),
      supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(4),
    ])
    setTeamCount(t.count || 0)
    setMatchCount(m.count || 0)
    setAuctionCount(a.count || 0)
    setAnnouncements(ann.data || [])
  }

  const annIcons = { info: 'ℹ️', warning: '⚠️', success: '✅', danger: '🚨' }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        {/* Floating bot emojis */}
        {floatingBots.map(b => (
          <div key={b.id} style={{
            position: 'absolute',
            left: `${b.x}%`, top: `${b.y}%`,
            fontSize: b.size,
            opacity: 0.06,
            animation: `float${b.id % 2 === 0 ? 'A' : 'B'} ${b.dur}s ease-in-out ${b.delay}s infinite`,
            pointerEvents: 'none',
          }}>
            {b.emoji}
          </div>
        ))}

        <style>{`
          @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-30px) rotate(10deg)} }
          @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(25px) rotate(-8deg)} }
        `}</style>

        <div className="hero-content fade-in-up">
          <div className="hero-eyebrow">⚡ Official Robot Combat Championship 2025</div>
          <h1 className="hero-title">
            <span className="line1">BATTLE</span>
            <span className="line2 glitch-text" data-text="BOTS">BOTS</span>
          </h1>
          <p className="hero-description">
            Steel meets strategy. Register your robot, bid on upgrades, and fight for glory in the ultimate combat engineering championship.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              ⚡ Register Your Team
            </Link>
            <Link to="/leaderboard" className="btn btn-outline">
              🏆 View Leaderboard
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{teamCount || '—'}</div>
              <div className="stat-label">Teams Registered</div>
            </div>
            <div className="stat">
              <div className="stat-number">{auctionCount || '—'}</div>
              <div className="stat-label">Auction Items</div>
            </div>
            <div className="stat">
              <div className="stat-number">{matchCount || '—'}</div>
              <div className="stat-label">Matches Scheduled</div>
            </div>
            <div className="stat">
              <div className="stat-number">1000</div>
              <div className="stat-label">Points Per Team</div>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2" fill="currentColor"/>
          </svg>
          SCROLL
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border2)', borderBottom: '1px solid var(--border2)', padding: '4rem 2rem', textAlign: 'center' }}>
        <p className="section-tag text-center" style={{ marginBottom: '0.5rem' }}>Event Starts In</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-dim)', marginBottom: '2.5rem', letterSpacing: '4px' }}>
          JULY 26, 2025 — ARENA ALPHA
        </h2>
        <Countdown targetDate="2025-07-26T09:00:00" />
      </section>

      {/* ── ANNOUNCEMENTS ── */}
      {announcements.length > 0 && (
        <section className="section">
          <div className="section-header">
            <p className="section-tag">Latest Updates</p>
            <h2 className="section-title">ANNOUNCEMENTS</h2>
          </div>
          {announcements.map(a => (
            <div key={a.id} className={`announcement ${a.type}`}>
              <div className="announcement-icon">{annIcons[a.type]}</div>
              <div>
                <div className="announcement-title">{a.title}</div>
                <div className="announcement-content">{a.content}</div>
              </div>
              {a.pinned && <div className="announcement-pin">📌 PINNED</div>}
            </div>
          ))}
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="section-header">
          <p className="section-tag">Platform Features</p>
          <h2 className="section-title">EVERYTHING YOU NEED</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 40, marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, rgba(255,58,0,0.08) 0%, rgba(255,107,0,0.05) 100%)', border: '1px solid var(--border)', borderRadius: 24, margin: '0 2rem 6rem', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,58,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,58,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <p className="section-tag">Ready to Compete?</p>
        <h2 className="section-title" style={{ marginBottom: '1rem', position: 'relative' }}>
          BUILD. BID. BATTLE.
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: 18, position: 'relative' }}>
          Register your team today and claim your starting 1000 points for the auction.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link to="/register" className="btn btn-primary">⚡ Register Now</Link>
          <Link to="/auction" className="btn btn-outline">💰 View Auction</Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border2)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-dim)', marginBottom: '0.5rem', letterSpacing: 2 }}>
          ⚡ BATTLEBOTS 2025
        </div>
        OFFICIAL ROBOT COMBAT CHAMPIONSHIP · ALL RIGHTS RESERVED
      </footer>
    </div>
  )
}
