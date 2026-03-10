export default function DoctorCard({ doctor, onBook }) {
  const initials = doctor.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar">{initials}</div>
        <div>
          <p className="doctor-name">{doctor.name}</p>
          <p className="doctor-spec">{doctor.specialization}</p>
        </div>
      </div>
      <div className="doctor-meta">
        <span className="doctor-tag">₹{doctor.fee}</span>
        <span className="doctor-tag">{doctor.experience}</span>
      </div>
      <button className="book-btn" onClick={onBook}>Check Availability →</button>
    </div>
  )
}
