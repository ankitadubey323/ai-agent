
// import { KokoroTTS } from 'kokoro-js'


// let ttsInstance = null
// let ttsLoading  = false

// async function getTTS() {
//     if (ttsInstance) return ttsInstance
//     if (ttsLoading) {
        
//         while (ttsLoading) await new Promise(r => setTimeout(r, 100))
//         return ttsInstance
//     }
//     ttsLoading = true
//     console.log('[TTS] Loading Kokoro model...')
//     ttsInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', {
//         dtype: 'q8',
//     })
//     ttsLoading = false
//     console.log('[TTS] Kokoro model loaded!')
//     return ttsInstance
// }

// const DEFAULT_VOICE = 'af_heart'

// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// function float32ToWavBuffer(float32Array, sampleRate = 24000) {
//     const numChannels   = 1
//     const bitsPerSample = 16
//     const byteRate      = sampleRate * numChannels * bitsPerSample / 8
//     const blockAlign    = numChannels * bitsPerSample / 8
//     const dataSize      = float32Array.length * 2
//     const buffer        = Buffer.alloc(44 + dataSize)

//     buffer.write('RIFF', 0)
//     buffer.writeUInt32LE(36 + dataSize, 4)
//     buffer.write('WAVE', 8)
//     buffer.write('fmt ', 12)
//     buffer.writeUInt32LE(16, 16)
//     buffer.writeUInt16LE(1, 20)
//     buffer.writeUInt16LE(numChannels, 22)
//     buffer.writeUInt32LE(sampleRate, 24)
//     buffer.writeUInt32LE(byteRate, 28)
//     buffer.writeUInt16LE(blockAlign, 32)
//     buffer.writeUInt16LE(bitsPerSample, 34)
//     buffer.write('data', 36)
//     buffer.writeUInt32LE(dataSize, 40)

//     for (let i = 0; i < float32Array.length; i++) {
//         const s = Math.max(-1, Math.min(1, float32Array[i]))
//         buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2)
//     }

//     return buffer
// }

// export async function textToSpeech(text, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')
//     const cleaned = cleanForSpeech(text)
//     const voice   = options.voiceId || DEFAULT_VOICE
//     console.log(`[TTS] Kokoro | Voice: ${voice} | "${cleaned.slice(0, 50)}"`)
//     const tts    = await getTTS()
//     const result = await tts.generate(cleaned, { voice })
//     return float32ToWavBuffer(result.audio, result.sampling_rate || 24000)
// }

// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')
//     const cleaned = cleanForSpeech(text)
//     const voice   = options.voiceId || DEFAULT_VOICE
//     console.log(`[TTS] Kokoro Stream | Voice: ${voice} | "${cleaned.slice(0, 50)}"`)

//     try {
//         const tts         = await getTTS()
//         const result      = await tts.generate(cleaned, { voice })
//         const audioBuffer = float32ToWavBuffer(result.audio, result.sampling_rate || 24000)

//         const chunkSize = 4096
//         for (let i = 0; i < audioBuffer.length; i += chunkSize) {
//             onChunk(audioBuffer.slice(i, i + chunkSize))
//         }

//         console.log(`[TTS] Sent ${audioBuffer.length} bytes`)
//         onDone()
//     } catch (err) {
//         console.error('[TTS] Error:', err.message)
//         onDone()
//         throw err
//     }
// }

// export function splitIntoSentences(text) {
//     return text
//         .replace(/([.!?।])\s+/g, '$1|||')
//         .split('|||')
//         .map(s => s.trim())
//         .filter(s => s.length > 2)
// }



import fetch from 'node-fetch'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // "Sarah" voice - ya apni pasand ki

function cleanForSpeech(text) {
    return text
        .replace(/[*_`#~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500)
}

export async function textToSpeech(text, options = {}) {
    if (!text?.trim()) throw new Error('TTS: No text provided')
    const cleaned = cleanForSpeech(text)
    const voiceId = options.voiceId || VOICE_ID

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: cleaned,
                model_id: 'eleven_monolingual_v1',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        }
    )

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`)
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
    if (!text?.trim()) throw new Error('TTS: No text provided')
    const cleaned = cleanForSpeech(text)
    const voiceId = options.voiceId || VOICE_ID

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: cleaned,
                model_id: 'eleven_monolingual_v1',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        }
    )

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`)

    response.body.on('data', chunk => onChunk(chunk))
    response.body.on('end', () => {
        console.log('[TTS] ElevenLabs stream done')
        onDone()
    })
}

export function splitIntoSentences(text) {
    return text
        .replace(/([.!?।])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 2)
}