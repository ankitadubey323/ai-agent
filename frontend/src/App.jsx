// import { useState, useRef, useCallback } from 'react'
// import { useSocket } from './hooks/useSocket'
// import { useAudio  } from './hooks/useAudio'
// import StatusBar    from './components/StatusBar'
// import ChatMessage  from './components/ChatMessage'
// import MicButton    from './components/MicButton'
// import DoctorCard   from './components/DoctorCard'
// import SlotPicker   from './components/SlotPicker'
// import NameModal    from './components/NameModal'
// import TextInput    from './components/TextInput'

// export default function App() {
//   const [messages,      setMessages]      = useState([])
//   const [status,        setStatus]        = useState('connecting')
//   const [isRecording,   setIsRecording]   = useState(false)
//   const [isSpeaking,    setIsSpeaking]    = useState(false)
//   const [doctors,       setDoctors]       = useState([])
//   const [slots,         setSlots]         = useState([])
//   const [showSlots,     setShowSlots]     = useState(false)
//   const [partialText,   setPartialText]   = useState('')
//   const [patientName,   setPatientName]   = useState('')
//   const [showNameModal, setShowNameModal] = useState(true)

//   const messagesEndRef = useRef(null)

//   function addMessage(role, text) {
//     setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }])
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
//   }

//   const { startRecording, stopRecording, accumulateChunk, playAccumulated, clearBuffer } = useAudio({
//     onChunk: (chunk) => emit('audio-stream', chunk),
//     onStop:  ()      => emit('end-utterance'),
//     onError: (msg)   => addMessage('system', msg),
//   })

//   const { emit } = useSocket({
//     onReady:               ({ message }) => { setStatus('ready'); addMessage('ai', message) },
//     onTranscriptPartial:   (text) => { setPartialText(text); setStatus('listening') },
//     onTranscript:          (text) => { setPartialText(''); addMessage('user', text); setStatus('thinking') },
//     onDoctorResponse:      (text) => addMessage('ai', text),
//     onTtsStart:            ()     => { setIsSpeaking(true); setStatus('speaking'); clearBuffer() },
//     onTtsAudio:            (chunk) => accumulateChunk(chunk),
//     onTtsEnd:              ()     => { setIsSpeaking(false); setStatus('ready'); playAccumulated(() => emit('tts-done-playing')) },
//     onTtsError:            ()     => { setIsSpeaking(false); setStatus('ready'); clearBuffer() },
//     onShowAppointmentBtn:  ({ doctors }) => setDoctors(doctors),
//     onAvailableSlots:      (slots) => { setSlots(slots); setShowSlots(true) },
//     onAppointmentConfirmed:(data)  => { addMessage('ai', data.message); setShowSlots(false); setDoctors([]) },
//     onAppointmentCancelled:(data)  => addMessage('ai', data.message),
//     onError:               (message) => { addMessage('system', message); setStatus('ready') },
//     onDisconnect:          () => setStatus('error'),
//   })

//   const handleMicStart = useCallback(async () => {
//     if (isRecording || isSpeaking) return
//     const ok = await startRecording()
//     if (ok) { setIsRecording(true); setStatus('listening') }
//   }, [isRecording, isSpeaking, startRecording])

//   const handleMicStop = useCallback(() => {
//     if (!isRecording) return
//     stopRecording()
//     setIsRecording(false)
//     setStatus('thinking')
//   }, [isRecording, stopRecording])

//   function handleSendText(text) { emit('text-message', text) }

//   function handleBookSlot(slot) {
//     emit('book-slot', { slotStart: slot.start, slotEnd: slot.end, patientName: patientName || 'Patient' })
//     setShowSlots(false)
//   }

//   function handleSubmitName(name) {
//     setPatientName(name)
//     setShowNameModal(false)
//     emit('set-patient-info', { name })
//   }

//   return (
//     <div className="app-shell">
//       <div className="bg-mesh" />
//       {showNameModal && <NameModal onSubmit={handleSubmitName} />}

//       <header className="app-header">
//         <div className="header-inner">
//           <div className="logo-mark">
//             <span className="logo-cross">✚</span>
//             <span className="logo-text">Dr<em>AI</em></span>
//           </div>
//           <div className="header-right">
//             <StatusBar status={status} />
//             {patientName && <span className="patient-badge">{patientName}</span>}
//           </div>
//         </div>
//       </header>

//       <section className="chat-area">
//         <div className="chat-inner">
//           {messages.length === 0 && (
//             <div className="empty-state">
//               <div className="pulse-ring">✚</div>
//               <p className="empty-title">Your AI Doctor is ready</p>
//               <p className="empty-sub">Hold the mic and describe your symptoms</p>
//             </div>
//           )}
//           {messages.map(msg => (
//             <ChatMessage key={msg.id} role={msg.role} text={msg.text} />
//           ))}
//           {partialText && (
//             <div className="partial-bubble">
//               <span className="partial-dot" />
//               {partialText}
//             </div>
//           )}
//           {doctors.length > 0 && (
//             <div className="doctor-cards-row">
//               {doctors.map((doc, i) => (
//                 <DoctorCard key={i} doctor={doc} onBook={() => emit('get-slots')} />
//               ))}
//             </div>
//           )}
//           {showSlots && (
//             <SlotPicker slots={slots} onBook={handleBookSlot} onClose={() => setShowSlots(false)} />
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </section>

//       <footer className="control-bar">
//         <TextInput onSend={handleSendText} disabled={isRecording || isSpeaking} />
//         <MicButton isRecording={isRecording} isSpeaking={isSpeaking} status={status} onStart={handleMicStart} onStop={handleMicStop} />
//       </footer>
//     </div>
//   )
// }






// import { useState, useRef, useCallback, useEffect } from 'react'
// import { useSocket } from './hooks/useSocket'
// import { useAudio  } from './hooks/useAudio'
// import StatusBar    from './components/StatusBar'
// import ChatMessage  from './components/ChatMessage'
// import MicButton    from './components/MicButton'
// import DoctorCard   from './components/DoctorCard'
// import SlotPicker   from './components/SlotPicker'
// import NameModal    from './components/NameModal'
// import TextInput    from './components/TextInput'

// export default function App() {
//   const [messages,      setMessages]      = useState([])
//   const [status,        setStatus]        = useState('connecting')
//   const [isRecording,   setIsRecording]   = useState(false)
//   const [isSpeaking,    setIsSpeaking]    = useState(false)
//   const [doctors,       setDoctors]       = useState([])
//   const [slots,         setSlots]         = useState([])
//   const [showSlots,     setShowSlots]     = useState(false)
//   const [partialText,   setPartialText]   = useState('')
//   const [patientName,   setPatientName]   = useState('')
//   const [showNameModal, setShowNameModal] = useState(true)


//   const messagesEndRef = useRef(null)
//   const emitRef        = useRef(null)

//   function addMessage(role, text) {
//     setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }])
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
//   }

//   const { startRecording, stopRecording, accumulateChunk, playAccumulated, clearBuffer } = useAudio({
//     onChunk: (chunk) => emitRef.current?.('audio-stream', chunk),
//     onStop:  ()      => emitRef.current?.('end-utterance'),
//     onError: (msg)   => {
//       addMessage('system', msg)
//       setIsRecording(false)
//       setStatus('ready')
//     },
//   })

//   const { emit } = useSocket({
//     onReady:              () => { setStatus('ready') },
//     onTranscriptPartial:  (text) => { setPartialText(text); setStatus('listening') },
//     onTranscript:         (text) => { setPartialText(''); addMessage('user', text); setStatus('thinking') },
//     onDoctorResponse:     (text) => addMessage('ai', text),

//     onTtsStart: ()      => { setIsSpeaking(true); setStatus('speaking'); clearBuffer() },
//     onTtsAudio: (chunk) => accumulateChunk(chunk),
//     onTtsEnd:   ()      => {
//       playAccumulated(() => {
//         setIsSpeaking(false)
//         setIsRecording(false)
//         setStatus('ready')
//         emitRef.current?.('tts-done-playing')
//       })
//     },
//     onTtsError: () => {
//       setIsSpeaking(false)
//       setIsRecording(false)
//       setStatus('ready')
//       clearBuffer()
//       emitRef.current?.('tts-done-playing')
//     },

//     onShowAppointmentBtn:  ({ doctors }) => setDoctors(doctors),
//     onAvailableSlots:      (slots) => { setSlots(slots); setShowSlots(true) },
//     onAppointmentConfirmed:(data)  => { addMessage('ai', data.message); setShowSlots(false); setDoctors([]) },
//     onAppointmentCancelled:(data)  => addMessage('ai', data.message),
//     onError:               (message) => { addMessage('system', message); setStatus('ready') },
//     onDisconnect:          () => { setStatus('error'); setIsSpeaking(false); setIsRecording(false) },
//   })

//   useEffect(() => { emitRef.current = emit }, [emit])

//   const handleMicStart = useCallback(async () => {
//     if (isRecording || isSpeaking) return
//     const ok = await startRecording()
//     if (ok) { setIsRecording(true); setStatus('listening') }
//   }, [isRecording, isSpeaking, startRecording])

//   const handleMicStop = useCallback(() => {
//     if (!isRecording) return
//     stopRecording()
//     setIsRecording(false)
//     setStatus('thinking')
//     setPartialText('')
//   }, [isRecording, stopRecording])

//   function handleSendText(text) {
//     if (!text.trim()) return
//     emitRef.current?.('text-message', text)
//   }

//   function handleBookSlot(slot) {
//     emitRef.current?.('book-slot', { slotStart: slot.start, slotEnd: slot.end, patientName: patientName || 'Patient' })
//     setShowSlots(false)
//   }

//   function handleSubmitName(name) {
//     setPatientName(name)
//     setShowNameModal(false)
//     emitRef.current?.('set-patient-info', { name })
//   }

//   return (
//     <div className="app-shell">
//       <div className="bg-mesh" />
//       {showNameModal && <NameModal onSubmit={handleSubmitName} />}

//       <header className="app-header">
//         <div className="header-inner">
//           <div className="logo-mark">
//             <span className="logo-cross">✚</span>
//             <span className="logo-text">Dr<em>AI</em></span>
//           </div>
//           <div className="header-right">
//             <StatusBar status={status} />
//             {patientName && <span className="patient-badge">{patientName}</span>}
//           </div>
//         </div>
//       </header>

//       <section className="chat-area">
//         <div className="chat-inner">
//           {messages.length === 0 && (
//             <div className="empty-state">
//               <div className="pulse-ring">✚</div>
//               <p className="empty-title">Your AI Doctor is ready</p>
//               <p className="empty-sub">Hold the mic and describe your symptoms</p>
//             </div>
//           )}
//           {messages.map(msg => (
//             <ChatMessage key={msg.id} role={msg.role} text={msg.text} />
//           ))}
//           {partialText && (
//             <div className="partial-bubble">
//               <span className="partial-dot" />
//               {partialText}
//             </div>
//           )}
//           {doctors.length > 0 && (
//             <div className="doctor-cards-row">
//               {doctors.map((doc, i) => (
//                 <DoctorCard key={i} doctor={doc} onBook={() => emitRef.current?.('get-slots')} />
//               ))}
//             </div>
//           )}
//           {showSlots && (
//             <SlotPicker slots={slots} onBook={handleBookSlot} onClose={() => setShowSlots(false)} />
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </section>

//       <footer className="control-bar">
//         <TextInput onSend={handleSendText} disabled={isRecording || isSpeaking} />
//         <MicButton
//           isRecording={isRecording}
//           isSpeaking={isSpeaking}
//           status={status}
//           onStart={handleMicStart}
//           onStop={handleMicStop}
//         />
//       </footer>
//     </div>
//   )
// }


import { useState, useRef, useCallback, useEffect } from 'react'
import { useSocket } from './hooks/useSocket'
import { useAudio  } from './hooks/useAudio'
import StatusBar    from './components/StatusBar'
import ChatMessage  from './components/ChatMessage'
import MicButton    from './components/MicButton'
import DoctorCard   from './components/DoctorCard'
import SlotPicker   from './components/SlotPicker'
import NameModal    from './components/NameModal'
import TextInput    from './components/TextInput'

export default function App() {
  const [messages,      setMessages]      = useState([])
  const [status,        setStatus]        = useState('connecting')
  const [isRecording,   setIsRecording]   = useState(false)
  const [isSpeaking,    setIsSpeaking]    = useState(false)
  const [doctors,       setDoctors]       = useState([])
  const [slots,         setSlots]         = useState([])
  const [showSlots,     setShowSlots]     = useState(false)
  const [partialText,   setPartialText]   = useState('')
  const [patientName,   setPatientName]   = useState('')
  const [patientEmail,  setPatientEmail]  = useState('') // ← NEW
  const [symptoms,      setSymptoms]      = useState('') // ← NEW
  const [showNameModal, setShowNameModal] = useState(true)

  const messagesEndRef = useRef(null)
  const emitRef        = useRef(null)

  function addMessage(role, text) {
    setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const { startRecording, stopRecording, accumulateChunk, playAccumulated, clearBuffer } = useAudio({
    onChunk: (chunk) => emitRef.current?.('audio-stream', chunk),
    onStop:  ()      => emitRef.current?.('end-utterance'),
    onError: (msg)   => {
      addMessage('system', msg)
      setIsRecording(false)
      setStatus('ready')
    },
  })

  const { emit } = useSocket({
    onReady:              () => { setStatus('ready') },
    onTranscriptPartial:  (text) => { setPartialText(text); setStatus('listening') },
    onTranscript:         (text) => {
      setPartialText('')
      addMessage('user', text)
      setStatus('thinking')
      setSymptoms(prev => prev + ' ' + text) // ← symptoms collect karo
    },
    onDoctorResponse:     (text) => addMessage('ai', text),

    onTtsStart: ()      => { setIsSpeaking(true); setStatus('speaking'); clearBuffer() },
    onTtsAudio: (chunk) => accumulateChunk(chunk),
    onTtsEnd:   ()      => {
      playAccumulated(() => {
        setIsSpeaking(false)
        setIsRecording(false)
        setStatus('ready')
        emitRef.current?.('tts-done-playing')
      })
    },
    onTtsError: () => {
      setIsSpeaking(false)
      setIsRecording(false)
      setStatus('ready')
      clearBuffer()
      emitRef.current?.('tts-done-playing')
    },

    onShowAppointmentBtn:  ({ doctors }) => setDoctors(doctors),
    onAvailableSlots:      (slots) => { setSlots(slots); setShowSlots(true) },
    onAppointmentConfirmed:(data)  => { addMessage('ai', data.message); setShowSlots(false); setDoctors([]) },
    onAppointmentCancelled:(data)  => addMessage('ai', data.message),
    onError:               (message) => { addMessage('system', message); setStatus('ready') },
    onDisconnect:          () => { setStatus('error'); setIsSpeaking(false); setIsRecording(false) },
  })

  useEffect(() => { emitRef.current = emit }, [emit])

  const handleMicStart = useCallback(async () => {
    if (isRecording || isSpeaking) return
    const ok = await startRecording()
    if (ok) { setIsRecording(true); setStatus('listening') }
  }, [isRecording, isSpeaking, startRecording])

  const handleMicStop = useCallback(() => {
    if (!isRecording) return
    stopRecording()
    setIsRecording(false)
    setStatus('thinking')
    setPartialText('')
  }, [isRecording, stopRecording])

  function handleSendText(text) {
    if (!text.trim()) return
    emitRef.current?.('text-message', text)
    setSymptoms(prev => prev + ' ' + text) // ← text se bhi symptoms collect karo
  }

  function handleBookSlot(slot) {
    emitRef.current?.('book-slot', { slotStart: slot.start, slotEnd: slot.end, patientName: patientName || 'Patient' })
    setShowSlots(false)
  }

  function handleSubmitName(name) {
    setPatientName(name)
    setShowNameModal(false)
    emitRef.current?.('set-patient-info', { name })
  }

  return (
    <div className="app-shell">
      <div className="bg-mesh" />
      {showNameModal && <NameModal onSubmit={handleSubmitName} />}

      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark">
            <span className="logo-cross">✚</span>
            <span className="logo-text">Dr<em>AI</em></span>
          </div>
          <div className="header-right">
            <StatusBar status={status} />
            {patientName && <span className="patient-badge">{patientName}</span>}
          </div>
        </div>
      </header>

      <section className="chat-area">
        <div className="chat-inner">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="pulse-ring">✚</div>
              <p className="empty-title">Your AI Doctor is ready</p>
              <p className="empty-sub">Hold the mic and describe your symptoms</p>
            </div>
          )}
          {messages.map(msg => (
            <ChatMessage key={msg.id} role={msg.role} text={msg.text} />
          ))}
          {partialText && (
            <div className="partial-bubble">
              <span className="partial-dot" />
              {partialText}
            </div>
          )}
          {doctors.length > 0 && (
            <div className="doctor-cards-row">
              {doctors.map((doc, i) => (
                <DoctorCard
                  key={i}
                  doctor={doc}
                  patientName={patientName}
                  patientEmail={patientEmail}
                  symptoms={symptoms.trim()}
                  onBookingRequested={(msg) => {
                    addMessage('ai', msg)
                    setDoctors([]) // cards hide karo booking ke baad
                  }}
                />
              ))}
            </div>
          )}
          {showSlots && (
            <SlotPicker slots={slots} onBook={handleBookSlot} onClose={() => setShowSlots(false)} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="control-bar">
        <TextInput onSend={handleSendText} disabled={isRecording || isSpeaking} />
        <MicButton
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          status={status}
          onStart={handleMicStart}
          onStop={handleMicStop}
        />
      </footer>
    </div>
  )
}
