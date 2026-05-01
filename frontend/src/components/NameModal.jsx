import { useState } from 'react'

export default function NameModal({ onSubmit }) {
  const [val, setVal] = useState('')
  const valid = val.trim().length >= 2

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">✚</div>
        <h2 className="modal-title">Welcome to DrAI</h2>
        <p className="modal-sub">Enter your name to begin your consultation</p>
        <input
          className="modal-input"
          placeholder="Your full name"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onSubmit(val.trim())}
          autoFocus
        />
        <button
          className="modal-btn"
          disabled={!valid}
          onClick={() => valid && onSubmit(val.trim())}
        >
          Begin Consultation
        </button>
      </div>
    </div>
  )
}
