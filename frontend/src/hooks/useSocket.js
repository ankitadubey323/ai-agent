
import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export function useSocket({ onReady, onTranscriptPartial, onTranscript, onDoctorResponse, onTtsStart, onTtsAudio, onTtsEnd, onTtsError, onShowAppointmentBtn, onAvailableSlots, onAppointmentConfirmed, onAppointmentCancelled, onError, onDisconnect }) {
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket'], reconnectionAttempts: 5 })
    socketRef.current = socket

    socket.on('ready',                onReady)
    socket.on('transcript-partial',   onTranscriptPartial)
    socket.on('transcript',           onTranscript)
    socket.on('doctor-response',      onDoctorResponse)
    socket.on('tts-start',            onTtsStart)
    socket.on('tts-audio',            onTtsAudio)
    socket.on('tts-end',              onTtsEnd)
    socket.on('tts-error',            onTtsError)
    socket.on('show-appointment-btn', onShowAppointmentBtn)
    socket.on('available-slots',      ({ slots }) => onAvailableSlots(slots))
    socket.on('appointment-confirmed',onAppointmentConfirmed)
    socket.on('appointment-cancelled',onAppointmentCancelled)
    socket.on('error',                ({ message }) => onError(message))
    socket.on('disconnect',           onDisconnect)

    return () => socket.disconnect()
  }, [])

  const emit = useCallback((event, data) => socketRef.current?.emit(event, data), [])
  return { emit }
}