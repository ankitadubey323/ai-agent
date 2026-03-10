import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export function useSocket(handlers) {
  const socketRef   = useRef(null)
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on('ready',                 (d) => handlersRef.current.onReady?.(d))
    socket.on('transcript-partial',    (d) => handlersRef.current.onTranscriptPartial?.(d))
    socket.on('transcript',            (d) => handlersRef.current.onTranscript?.(d))
    socket.on('doctor-response',       (d) => handlersRef.current.onDoctorResponse?.(d))
    socket.on('tts-start',             (d) => handlersRef.current.onTtsStart?.(d))
    socket.on('tts-audio',             (d) => handlersRef.current.onTtsAudio?.(d))
    socket.on('tts-end',               (d) => handlersRef.current.onTtsEnd?.(d))
    socket.on('tts-error',             (d) => handlersRef.current.onTtsError?.(d))
    socket.on('show-appointment-btn',  (d) => handlersRef.current.onShowAppointmentBtn?.(d))
    socket.on('available-slots',       (d) => handlersRef.current.onAvailableSlots?.(d.slots))
    socket.on('appointment-confirmed', (d) => handlersRef.current.onAppointmentConfirmed?.(d))
    socket.on('appointment-cancelled', (d) => handlersRef.current.onAppointmentCancelled?.(d))
    socket.on('error',                 (d) => handlersRef.current.onError?.(d.message))
    socket.on('disconnect',            (d) => handlersRef.current.onDisconnect?.(d))

    return () => socket.disconnect()
  }, [])

  const emit = useCallback((event, data) => socketRef.current?.emit(event, data), [])
  return { emit }
}