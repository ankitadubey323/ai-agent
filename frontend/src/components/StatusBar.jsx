const STATUS_MAP = {
  connecting: { label: 'Connecting',   color: '#94a3b8', pulse: true  },
  ready:      { label: 'Ready',        color: '#4ade80', pulse: false },
  listening:  { label: 'Listening',    color: '#38bdf8', pulse: true  },
  thinking:   { label: 'Thinking',     color: '#fbbf24', pulse: true  },
  speaking:   { label: 'Speaking',     color: '#a78bfa', pulse: true  },
  error:      { label: 'Disconnected', color: '#f87171', pulse: false },
}
export default function StatusBar({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.ready
  return (
    <div className="status-bar">
      <span className={`status-dot ${s.pulse ? 'pulsing' : ''}`} style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
      <span className="status-label" style={{ color: s.color }}>{s.label}</span>
    </div>
  )
}
