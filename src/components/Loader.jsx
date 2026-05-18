import { useEffect, useState, useRef } from 'react'

const STEPS = [
  'Initializing arena systems...',
  'Loading bot specifications...',
  'Calibrating weapon arrays...',
  'Charging capacitors...',
  'Syncing combat protocols...',
  'All systems nominal. FIGHT!'
]

function Spark({ style }) {
  return <div className="spark" style={style} />
}

export default function Loader() {
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [sparks, setSparks] = useState([])

  useEffect(() => {
    // Generate random sparks
    setSparks(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${2 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 3}s`,
      opacity: 0.3 + Math.random() * 0.7,
      width: `${1 + Math.random() * 3}px`,
      height: `${1 + Math.random() * 3}px`,
    })))

    // Progress animation
    const total = 3000
    const interval = 40
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const pct = Math.min(100, Math.round((elapsed / total) * 100))
      setProgress(pct)
      const si = Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))
      setStepIdx(si)
      if (elapsed >= total) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-grid" />
      <div className="loading-sparks">
        {sparks.map(s => (
          <Spark key={s.id} style={{
            left: s.left,
            bottom: 0,
            animationDuration: s.animationDuration,
            animationDelay: s.animationDelay,
            opacity: s.opacity,
            width: s.width,
            height: s.height,
            background: s.id % 3 === 0 ? 'var(--cyan)' : s.id % 3 === 1 ? 'var(--orange)' : 'var(--yellow)',
          }} />
        ))}
      </div>

      <div className="loading-subtitle">OFFICIAL ROBOT COMBAT CHAMPIONSHIP</div>

      <div className="loading-logo">
        BATTLE
        <br />
        BOTS
      </div>

      <div className="loading-subtitle" style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '4px' }}>
        2025 SEASON
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className="loading-text">{STEPS[stepIdx]}</span>
          <span className="loading-text" style={{ color: 'var(--orange)' }}>{progress}%</span>
        </div>
        <div className="loading-bar-container" style={{ width: '100%' }}>
          <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Hex decorations */}
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${80 + i * 60}px`,
          height: `${80 + i * 60}px`,
          border: `1px solid rgba(255,58,0,${0.06 - i * 0.015})`,
          borderRadius: '50%',
          animation: `spin ${8 + i * 4}s linear infinite ${i % 2 ? 'reverse' : ''}`,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  )
}
