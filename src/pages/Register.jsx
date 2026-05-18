import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const WEIGHT_CLASSES = ['Featherweight', 'Lightweight', 'Middleweight', 'Heavyweight']
const WEIGHT_DESCRIPTIONS = {
  Featherweight: 'Up to 2.27 kg',
  Lightweight: 'Up to 4.54 kg',
  Middleweight: 'Up to 6.8 kg',
  Heavyweight: 'Up to 13.6 kg',
}
const COLORS = ['#FF3A00','#FF6B00','#FFD600','#00FF87','#00E5FF','#9B5DFF','#FF007A','#FFFFFF']

const initialForm = {
  team_name: '', captain_name: '', captain_email: '', phone: '',
  college: '', bot_name: '', bot_weight_class: '', members: ['', '', ''],
  avatar_color: '#FF3A00',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setMember = (i, v) => {
    const members = [...form.members]
    members[i] = v
    set('members', members)
  }

  const validate = () => {
    const e = {}
    if (!form.team_name.trim()) e.team_name = 'Team name required'
    if (!form.captain_name.trim()) e.captain_name = 'Captain name required'
    if (!form.captain_email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.captain_email = 'Valid email required'
    if (!form.phone.match(/^\d{10}$/)) e.phone = '10-digit phone required'
    if (!form.college.trim()) e.college = 'College/institution required'
    if (!form.bot_name.trim()) e.bot_name = 'Bot name required'
    if (!form.bot_weight_class) e.bot_weight_class = 'Select a weight class'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const members = form.members.filter(m => m.trim())
      const { data, error } = await supabase.from('teams').insert([{
        team_name: form.team_name.trim(),
        captain_name: form.captain_name.trim(),
        captain_email: form.captain_email.toLowerCase().trim(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        bot_name: form.bot_name.trim(),
        bot_weight_class: form.bot_weight_class,
        members,
        avatar_color: form.avatar_color,
        points: 1000,
        status: 'pending',
      }]).select().single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Team name or email already registered!')
        } else {
          toast.error('Registration failed. Please try again.')
        }
        return
      }
      setSuccess(data)
      toast.success('Registration submitted!')
      setForm(initialForm)
    } catch (err) {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 64, marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: 2, marginBottom: '1rem', color: 'var(--green)' }}>
            REGISTERED!
          </h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
            Team <strong style={{ color: 'var(--text)' }}>{success.team_name}</strong> is registered and awaiting admin approval. You'll receive confirmation soon.
          </p>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
            <div>Team ID: <span style={{ color: 'var(--cyan)' }}>{success.id?.slice(0, 8)}...</span></div>
            <div>Bot: <span style={{ color: 'var(--orange)' }}>{success.bot_name}</span></div>
            <div>Starting Points: <span style={{ color: 'var(--yellow)' }}>1000 pts</span></div>
          </div>
          <button className="btn btn-primary w-full" onClick={() => setSuccess(null)}>
            Register Another Team
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{ maxWidth: 800 }}>
      <div className="section-header">
        <p className="section-tag">Join the Fight</p>
        <h1 className="section-title">REGISTER YOUR TEAM</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.75rem' }}>
          Each team receives <strong style={{ color: 'var(--yellow)' }}>1000 points</strong> to spend in the component auction. Use them wisely.
        </p>
      </div>

      {/* Weight Class Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {WEIGHT_CLASSES.map(wc => (
          <div
            key={wc}
            onClick={() => set('bot_weight_class', wc)}
            className="card"
            style={{
              cursor: 'pointer',
              border: form.bot_weight_class === wc ? '1px solid var(--red)' : undefined,
              background: form.bot_weight_class === wc ? 'rgba(255,58,0,0.06)' : undefined,
              padding: '1rem',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 1 }}>{wc}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{WEIGHT_DESCRIPTIONS[wc]}</div>
          </div>
        ))}
      </div>
      {errors.bot_weight_class && <p className="form-error" style={{ marginBottom: '1rem' }}>{errors.bot_weight_class}</p>}

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Team Details */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, marginBottom: '1.25rem', color: 'var(--orange)' }}>
            TEAM DETAILS
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Team Name *</label>
              <input className="form-input" placeholder="e.g. Iron Crusher" value={form.team_name} onChange={e => set('team_name', e.target.value)} />
              {errors.team_name && <span className="form-error">{errors.team_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Bot Name *</label>
              <input className="form-input" placeholder="e.g. Destructor 3000" value={form.bot_name} onChange={e => set('bot_name', e.target.value)} />
              {errors.bot_name && <span className="form-error">{errors.bot_name}</span>}
            </div>
            <div className="form-group span-2">
              <label className="form-label">College / Institution *</label>
              <input className="form-input" placeholder="Your college or university" value={form.college} onChange={e => set('college', e.target.value)} />
              {errors.college && <span className="form-error">{errors.college}</span>}
            </div>
          </div>

          {/* Avatar Color */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Team Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 6 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => set('avatar_color', c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c,
                    border: form.avatar_color === c ? '3px solid white' : '2px solid transparent',
                    boxShadow: form.avatar_color === c ? `0 0 0 2px ${c}` : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Captain Details */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, marginBottom: '1.25rem', color: 'var(--cyan)' }}>
            CAPTAIN DETAILS
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Captain Name *</label>
              <input className="form-input" placeholder="Full name" value={form.captain_name} onChange={e => set('captain_name', e.target.value)} />
              {errors.captain_name && <span className="form-error">{errors.captain_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
            <div className="form-group span-2">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="captain@college.edu" value={form.captain_email} onChange={e => set('captain_email', e.target.value)} />
              {errors.captain_email && <span className="form-error">{errors.captain_email}</span>}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, marginBottom: '1.25rem', color: 'var(--purple)' }}>
            TEAM MEMBERS <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>(optional)</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.members.map((m, i) => (
              <div className="form-group" key={i}>
                <label className="form-label">Member {i + 1}</label>
                <input className="form-input" placeholder={`Team member ${i + 1} name`} value={m} onChange={e => setMember(i, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '18px', fontSize: '15px' }}
        >
          {loading ? <><div className="spinner" />SUBMITTING...</> : '⚡ SUBMIT REGISTRATION'}
        </button>
      </div>
    </div>
  )
}
