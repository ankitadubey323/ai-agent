import { useState } from 'react'
export default function TextInput({ onSend, disabled }) {
  const [val, setVal] = useState('')
  function send() { if (!val.trim() || disabled) return; onSend(val.trim()); setVal('') }
  return (
    <div className="text-input-wrap">
      <input className="text-input" placeholder="Or type your symptoms..." value={val}
        disabled={disabled} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()} />
      <button className="send-btn" onClick={send} disabled={disabled || !val.trim()}>↑</button>
    </div>
  )
}
