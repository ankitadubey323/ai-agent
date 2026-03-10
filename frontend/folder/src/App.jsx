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
import './index.css'

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
  const [showNameModal, setShowNameModal] = useState(true)

  const messagesEndRef = useRef(null)
  const emitRef        = useRef(null)
  const audioRef       = useRef(null)

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices()
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  function addMessage(role, text) {
    setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function speak(text) {
    if (!text?.trim()) return
    window.speechSynthesis.cancel()
    const clean  = text.replace(/<[^>]*>/g, '').replace(/\*/g, '').trim()
    const voices = window.speechSynthesis.getVoices()
    const utt    = new SpeechSynthesisUtterance(clean)
    utt.rate     = 1.0
    utt.pitch    = 1.0
    utt.volume   = 1.0

    const best =
      voices.find(v => v.name.includes('Neerja'))   ||
      voices.find(v => v.name.includes('Heera'))    ||
      voices.find(v => v.name.includes('Hemant'))   ||
      voices.find(v => v.lang === 'hi-IN')          ||
      voices.find(v => v.name === 'Microsoft Aria Online (Natural) - English (United States)') ||
      voices.find(v => v.name === 'Microsoft Jenny Online (Natural) - English (United States)') ||
      voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang.startsWith('en'))

    if (best) utt.voice = best

    utt.onstart = () => { setIsSpeaking(true);  setStatus('speaking') }
    utt.onend   = () => { setIsSpeaking(false); setStatus('ready') }
    utt.onerror = () => { setIsSpeaking(false); setStatus('ready') }

    window.speechSynthesis.speak(utt)
  }

  const audio = useAudio({
    onChunk: (chunk) => emitRef.current?.('audio-stream', chunk),
    onStop:  ()      => emitRef.current?.('end-utterance'),
    onError: (msg)   => {
      addMessage('system', msg)
      setIsRecording(false)
      setStatus('ready')
    },
  })

  useEffect(() => { audioRef.current = audio }, [audio])

  const { emit } = useSocket({
    onReady: () => {
      setStatus('ready')
    },

    onTranscriptPartial: (text) => {
      setPartialText(text)
      setStatus('listening')
    },

    onTranscript: (text) => {
      setPartialText('')
      addMessage('user', text)
      setStatus('thinking')
      window.speechSynthesis.cancel()
    },

    onDoctorResponse: (text) => {
      addMessage('ai', text)
      setTimeout(() => speak(text), 100)
    },

    onTtsStart: () => {},
    onTtsAudio: () => {},
    onTtsEnd:   () => {},
    onTtsError: () => {},

    onShowAppointmentBtn: ({ doctors }) => {
      setDoctors(doctors)
    },

    onAvailableSlots: (slots) => {
      setSlots(slots)
      setShowSlots(true)
    },

    onAppointmentConfirmed: (data) => {
      addMessage('ai', data.message)
      setTimeout(() => speak(data.message), 100)
      setShowSlots(false)
      setDoctors([])
    },

    onAppointmentCancelled: (data) => {
      addMessage('ai', data.message)
      setTimeout(() => speak(data.message), 100)
    },

    onError: (message) => {
      addMessage('system', message)
      setStatus('ready')
    },

    onDisconnect: () => {
      setStatus('error')
      setIsSpeaking(false)
      window.speechSynthesis.cancel()
    },
  })

  useEffect(() => { emitRef.current = emit }, [emit])

  const handleMicStart = useCallback(async () => {
    if (isRecording || isSpeaking) return
    window.speechSynthesis.cancel()
    const ok = await audio.startRecording()
    if (ok) { setIsRecording(true); setStatus('listening') }
  }, [isRecording, isSpeaking, audio])

  const handleMicStop = useCallback(() => {
    if (!isRecording) return
    audio.stopRecording()
    setIsRecording(false)
    setStatus('thinking')
  }, [isRecording, audio])

  function handleSendText(text) {
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    emit('text-message', text)
  }

  function handleBookSlot(slot) {
    emit('book-slot', {
      slotStart:   slot.start,
      slotEnd:     slot.end,
      patientName: patientName || 'Patient',
    })
    setShowSlots(false)
  }

  function handleSubmitName(name) {
    setPatientName(name)
    setShowNameModal(false)
    emit('set-patient-info', { name })
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
              <p className="empty-title">Apni problem batao</p>
              <p className="empty-sub">
                Mic dabao ya type karo — kisi bhi language mein.<br />
                Doctor aapki baat sunkar suggest karega.
              </p>
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
                <DoctorCard key={i} doctor={doc} onBook={() => emit('get-slots')} />
              ))}
            </div>
          )}

          {showSlots && (
            <SlotPicker
              slots={slots}
              onBook={handleBookSlot}
              onClose={() => setShowSlots(false)}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="control-bar">
        <TextInput
          onSend={handleSendText}
          disabled={isRecording || isSpeaking}
        />
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