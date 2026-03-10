import { useRef, useCallback } from 'react'

export function useAudio({ onChunk, onStop, onError }) {
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const audioContextRef  = useRef(null)
  const mp3BufferRef     = useRef([])
  const isPlayingRef     = useRef(false)

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  const startRecording = useCallback(async () => {
    try {
      ensureAudioContext()
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      audioChunksRef.current   = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob  = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const buf   = await blob.arrayBuffer()
        const uint8 = new Uint8Array(buf)
        for (let i = 0; i < uint8.length; i += 4096) {
          onChunk(uint8.slice(i, i + 4096))
        }
        onStop()
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start(250)
      return true
    } catch (err) {
      console.error('Error accessing microphone:', err)
      onError('Microphone access denied. Please allow mic and retry.')
      return false
    }
  }, [onChunk, onStop, onError, ensureAudioContext])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const accumulateChunk = useCallback((chunk) => {
    try {
      let arr
      if (chunk instanceof Uint8Array) {
        arr = chunk
      } else if (chunk instanceof ArrayBuffer) {
        arr = new Uint8Array(chunk)
      } else if (Array.isArray(chunk)) {
        arr = new Uint8Array(chunk)
      } else if (chunk?.buffer instanceof ArrayBuffer) {
        arr = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
      } else if (typeof chunk === 'object' && chunk !== null) {
        // socket.io plain object {0:1, 1:2, ...}
        arr = new Uint8Array(Object.values(chunk))
      } else {
        console.warn('[Audio] Unknown chunk type:', typeof chunk)
        return
      }
      mp3BufferRef.current.push(arr)
    } catch (err) {
      console.warn('[Audio] accumulateChunk error:', err.message)
    }
  }, [])

  const clearBuffer = useCallback(() => {
    mp3BufferRef.current = []
    isPlayingRef.current = false
  }, [])

  const playAccumulated = useCallback(async (onDone) => {
    if (!mp3BufferRef.current.length) {
      onDone?.()
      return
    }
    if (isPlayingRef.current) return
    isPlayingRef.current = true

    try {
      const totalLength = mp3BufferRef.current.reduce((sum, a) => sum + a.length, 0)
      const merged      = new Uint8Array(totalLength)
      let offset        = 0
      for (const chunk of mp3BufferRef.current) {
        merged.set(chunk, offset)
        offset += chunk.length
      }
      mp3BufferRef.current = []

      const ctx     = ensureAudioContext()
      const decoded = await ctx.decodeAudioData(merged.buffer.slice(0))
      const source  = ctx.createBufferSource()
      source.buffer = decoded
      source.connect(ctx.destination)
      source.start(0)
      source.onended = () => {
        isPlayingRef.current = false
        onDone?.()
      }
    } catch (err) {
      console.warn('[Audio] Playback failed:', err.message)
      mp3BufferRef.current = []
      isPlayingRef.current = false
      onDone?.()
    }
  }, [ensureAudioContext])

  return { startRecording, stopRecording, accumulateChunk, playAccumulated, clearBuffer }
}