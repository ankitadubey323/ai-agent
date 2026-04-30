import { useState } from 'react'

export default function DoctorCard({ doctor, patientName, patientEmail, symptoms, onBookingRequested }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const initials = doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  // Next 30 days generate karo
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })

  const formatDate = (d) => d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  const handleRequestBooking = async () => {
    if (!selectedDate) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_AGENT_URL || 'http://localhost:3000'}/api/appointments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName:           doctor.name,
          doctorEmail:          doctor.email,
          doctorPhone:          doctor.phone || '',
          doctorSpecialization: doctor.specialization,
          patientName:          patientName || 'Patient',
          patientEmail:         patientEmail || '',
          symptoms:             symptoms || '',
          date:                 formatDate(selectedDate),
        })
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        onBookingRequested?.(`Booking request sent to Dr. ${doctor.name} for ${formatDate(selectedDate)}. You will receive a confirmation email once the doctor accepts.`)
      }
    } catch (err) {
      console.error('Booking request failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="doctor-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
          <p style={{ fontWeight: '700', color: '#10B981', fontSize: '14px' }}>
            Request sent to Dr. {doctor.name}!
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            Check your email for confirmation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="doctor-card">
      {/* Doctor Info */}
      <div className="doctor-card-header">
        <div className="doctor-avatar">{initials}</div>
        <div>
          <p className="doctor-name">{doctor.name}</p>
          <p className="doctor-spec">{doctor.specialization}</p>
        </div>
      </div>

      <div className="doctor-meta">
        {doctor.fee && <span className="doctor-tag">₹{doctor.fee}</span>}
        {doctor.experience && <span className="doctor-tag">{doctor.experience} yrs</span>}
        {doctor.city && <span className="doctor-tag">📍{doctor.city}</span>}
      </div>

      {/* Book Button */}
      {!showCalendar && (
        <button className="book-btn" onClick={() => setShowCalendar(true)}>
          Book Appointment →
        </button>
      )}

      {/* Calendar */}
      {showCalendar && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
            Select a date:
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            maxHeight: '140px', overflowY: 'auto',
          }}>
            {dates.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${selectedDate === d ? '#10B981' : '#374151'}`,
                  background: selectedDate === d ? '#10B981' : '#1a2332',
                  color: selectedDate === d ? '#fff' : '#9CA3AF',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: selectedDate === d ? '700' : '400',
                  transition: 'all 0.15s ease',
                }}
              >
                {formatDate(d)}
              </button>
            ))}
          </div>

          {selectedDate && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#10B981', marginBottom: '8px' }}>
                Selected: <strong>{formatDate(selectedDate)}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRequestBooking}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: loading ? '#374151' : '#10B981',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Request →'}
                </button>
                <button
                  onClick={() => { setShowCalendar(false); setSelectedDate(null) }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    background: 'transparent',
                    color: '#9CA3AF',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

