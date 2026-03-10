import { useState, useEffect } from 'react'

export default function TextInput({ onSend, disabled, value }) {
  const [val, setVal] = useState('')

  useEffect(() => {
    if (value) {
      setVal(value)
    } else if (val.trim()) {
      onSend(val.trim())
      setVal('')
    }
  }, [value])

  function send() {
    if (!val.trim() || disabled) return
    onSend(val.trim())
    setVal('')
  }

  return (
    <div className="text-input-wrap">
      <input
        className="text-input"
        placeholder="Or type your symptoms..."
        value={val}
        disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
      />
      <button className="send-btn" onClick={send} disabled={disabled || !val.trim()}>↑</button>
    </div>
  )
}