import { useState } from 'react'
export default function SlotPicker({ slots, onBook, onClose }) {
  const [selected, setSelected] = useState(null)
  return (
    <div className="slot-picker">
      <div className="slot-picker-header">
        <h3 className="slot-title">Available Appointment Slots</h3>
        <button className="slot-close" onClick={onClose}>✕</button>
      </div>
      <div className="slot-grid">
        {slots.map((slot, i) => (
          <button key={i} className={`slot-chip ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)}>
            {slot.display}
          </button>
        ))}
      </div>
      <button className="confirm-btn" disabled={selected === null} onClick={() => selected !== null && onBook(slots[selected])}>
        Confirm Appointment
      </button>
    </div>
  )
}