import { useRef, useCallback } from 'react'

export function useAudio({ onChunk, onStop, onError }) {
  const audioContextRef    = useRef(null)
  const processorRef       = useRef(null)
  const streamRef          = useRef(null)
  const mp3BufferRef       = useRef([])
  const isPlayingRef       = useRef(false)

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      // 16000 Hz — AssemblyAI ke liye
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = ensureAudioContext()
      const source = ctx.createMediaStreamSource(stream)

      // ScriptProcessor se real-time PCM chunks
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0)
        // Float32 → Int16 PCM convert
        const int16 = new Int16Array(float32.length)
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]))
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        onChunk(new Uint8Array(int16.buffer))
      }

      source.connect(processor)
      processor.connect(ctx.destination)

      return true
    } catch (err) {
      console.error('Error accessing microphone:', err)
      onError('Microphone access denied. Please allow mic and retry.')
      return false
    }
  }, [onChunk, onStop, onError, ensureAudioContext])

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    onStop()
  }, [onStop])

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