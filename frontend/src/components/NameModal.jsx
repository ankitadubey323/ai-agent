// import { useState } from 'react'
// export default function NameModal({ onSubmit }) {
//   const [val, setVal] = useState('')
//   const valid = val.trim().length >= 2
//   return (
//     <div className="modal-overlay">
//       <div className="modal-card">
//         <div className="modal-icon">✚</div>
//         <h2 className="modal-title">Welcome to DrAI</h2>
//         <p className="modal-sub">Enter your name to begin your consultation</p>
//         <input className="modal-input" placeholder="Your full name" value={val}
//           onChange={e => setVal(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && valid && onSubmit(val.trim())} autoFocus />
//         <button className="modal-btn" disabled={!valid} onClick={() => valid && onSubmit(val.trim())}>
//           Begin Consultation
//         </button>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'

export default function NameModal({ onSubmit }) {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')

  const nameValid  = name.trim().length >= 2
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const valid      = nameValid && emailValid

  const handleSubmit = () => {
    if (!valid) return
    onSubmit(name.trim(), email.trim())
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">✚</div>
        <h2 className="modal-title">Welcome to DrAI</h2>
        <p className="modal-sub">Enter your details to begin your consultation</p>

        <input
          className="modal-input"
          placeholder="Your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && emailValid && handleSubmit()}
          autoFocus
        />

        <input
          className="modal-input"
          placeholder="Your email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ marginTop: '10px' }}
        />

        <button
          className="modal-btn"
          disabled={!valid}
          onClick={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          Begin Consultation
        </button>
      </div>
    </div>
  )
}
