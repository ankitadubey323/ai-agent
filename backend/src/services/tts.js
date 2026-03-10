// import { config } from '../config.js'

// const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'

// export const VOICES = {
//     default: config.elevenLabsVoiceId || 'i52w6eOAcpRkTE6yOgGq',
//     male:    'VR6AewLTigWG4xSOukaG',
//     female:  'EXAVITQu4vr4xnSDxMaL',
//     hindi:   config.elevenLabsVoiceId || 'i52w6eOAcpRkTE6yOgGq',
// }

// async function withRetry(fn, retries = 2, delayMs = 400) {
//     for (let attempt = 0; attempt <= retries; attempt++) {
//         try {
//             return await fn()
//         } catch (err) {
//             if (attempt === retries) throw err
//             const retryable = err.status === 429 || err.status >= 500
//             if (!retryable) throw err
//             await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
//         }
//     }
// }

// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// export async function textToSpeech(text, {
//     voiceId    = null,
//     voiceType  = 'default',
//     stability  = 0.35,
//     similarity = 0.75,
//     style      = 0.40,
//     speed      = 0.90,
// } = {}) {
//     if (!text?.trim())            throw new Error('TTS: No text provided')
//     if (!config.elevenLabsApiKey) throw new Error('TTS: ElevenLabs API key not configured')

//     const cleaned = cleanForSpeech(text)
//     const voice   = voiceId || VOICES[voiceType] || VOICES.default

//     return withRetry(async () => {
//         const response = await fetch(
//             `${ELEVENLABS_BASE}/text-to-speech/${voice}?output_format=mp3_44100_128`,
//             {
//                 method:  'POST',
//                 headers: {
//                     'xi-api-key':   config.elevenLabsApiKey,
//                     'Content-Type': 'application/json',
//                     'Accept':       'audio/mpeg',
//                 },
//                 body: JSON.stringify({
//                     text:     cleaned,
//                     model_id: 'eleven_multilingual_v2',
//                     voice_settings: {
//                         stability,
//                         similarity_boost:  similarity,
//                         style,
//                         speed,
//                         use_speaker_boost: true,
//                     },
//                 }),
//             }
//         )

//         if (!response.ok) {
//             const errBody = await response.text().catch(() => '')
//             const err     = new Error(`ElevenLabs ${response.status}: ${errBody}`)
//             err.status    = response.status
//             throw err
//         }

//         const buf = Buffer.from(await response.arrayBuffer())
//         console.log(`[TTS] ${buf.length} bytes — "${cleaned.slice(0, 50)}..."`)
//         return buf
//     })
// }

// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim())            throw new Error('TTS: No text provided')
//     if (!config.elevenLabsApiKey) throw new Error('TTS: ElevenLabs API key not configured')

//     const cleaned = cleanForSpeech(text)
//     const voice   = options.voiceId || VOICES[options.voiceType || 'default'] || VOICES.default

//     const response = await fetch(
//         `${ELEVENLABS_BASE}/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
//         {
//             method:  'POST',
//             headers: {
//                 'xi-api-key':   config.elevenLabsApiKey,
//                 'Content-Type': 'application/json',
//                 'Accept':       'audio/mpeg',
//             },
//             body: JSON.stringify({
//                 text:     cleaned,
//                 model_id: 'eleven_multilingual_v2',
//                 voice_settings: {
//                     stability:         options.stability  ?? 0.35,
//                     similarity_boost:  options.similarity ?? 0.75,
//                     style:             options.style      ?? 0.40,
//                     speed:             options.speed      ?? 0.90,
//                     use_speaker_boost: true,
//                 },
//             }),
//         }
//     )

//     if (!response.ok) {
//         const errBody = await response.text().catch(() => '')
//         throw new Error(`ElevenLabs stream ${response.status}: ${errBody}`)
//     }

//     const reader = response.body.getReader()
//     let total    = 0

//     while (true) {
//         const { done, value } = await reader.read()
//         if (done) break
//         const chunk = Buffer.from(value)
//         total += chunk.length
//         onChunk(chunk)
//     }

//     console.log(`[TTS] Streamed ${total} bytes — "${cleaned.slice(0, 50)}..."`)
//     onDone()
// }

// export function splitIntoSentences(text) {
//     return text
//         .replace(/([.!?।])\s+/g, '$1|||')
//         .split('|||')
//         .map(s => s.trim())
//         .filter(s => s.length > 2)
// }

// import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// // ── Voice map by language ─────────────────────────────────────────────────
// // All Indian + common international voices
// const VOICE_MAP = {
//     hindi:      'hi-IN-SwaraNeural',       // Indian female — best Hindi
//     english:    'en-IN-NeerjaNeural',      // Indian English female — natural
//     hinglish:   'hi-IN-SwaraNeural',       // Hinglish — Hindi voice works best
//     tamil:      'ta-IN-PallaviNeural',     // Tamil female
//     telugu:     'te-IN-ShrutiNeural',      // Telugu female
//     bengali:    'bn-IN-TanishaaNeural',    // Bengali female
//     marathi:    'mr-IN-AarohiNeural',      // Marathi female
//     gujarati:   'gu-IN-DhwaniNeural',      // Gujarati female
//     kannada:    'kn-IN-SapnaNeural',       // Kannada female
//     malayalam:  'ml-IN-SobhanaNeural',     // Malayalam female
//     punjabi:    'pa-IN-VaaniNeural',       // Punjabi female
//     arabic:     'ar-SA-ZariyahNeural',     // Arabic female
//     urdu:       'ur-PK-UzmaNeural',        // Urdu female
//     french:     'fr-FR-DeniseNeural',      // French female
//     spanish:    'es-ES-ElviraNeural',      // Spanish female
//     default:    'en-IN-NeerjaNeural',      // fallback
// }

// // ── Auto detect language from text ───────────────────────────────────────
// function detectLanguage(text) {
//     if (/[\u0900-\u097F]/.test(text)) return 'hindi'      // Devanagari
//     if (/[\u0600-\u06FF]/.test(text)) return 'arabic'     // Arabic/Urdu
//     if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil'      // Tamil
//     if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu'     // Telugu
//     if (/[\u0980-\u09FF]/.test(text)) return 'bengali'    // Bengali
//     if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada'    // Kannada
//     if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam'  // Malayalam
//     if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati'   // Gujarati
//     if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi'    // Punjabi

//     // Hinglish detection — common Hindi words in Latin script
//     if (/\b(hai|hain|kya|nahi|aur|mein|se|ko|ka|ki|ho|tha|thi|aap|main|hum|tum|yeh|woh|kab|kaise|kitna|kyun|abhi|phir|bukhar|dard|dawai|theek)\b/i.test(text)) {
//         return 'hinglish'
//     }

//     return 'english'
// }

// // ── Clean text for speech ─────────────────────────────────────────────────
// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// // ── Main TTS function (returns Buffer) ───────────────────────────────────
// export async function textToSpeech(text, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned  = cleanForSpeech(text)
//     const lang     = detectLanguage(cleaned)
//     const voiceId  = options.voiceId || VOICE_MAP[lang] || VOICE_MAP.default

//     console.log(`[TTS] Language: ${lang} | Voice: ${voiceId}`)

//     const tts = new MsEdgeTTS()
//     await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

//     return new Promise((resolve, reject) => {
//         const chunks = []
//         const { audioStream } = tts.toStream(cleaned)

//         audioStream.on('data',  chunk => chunks.push(chunk))
//         audioStream.on('end',   ()    => resolve(Buffer.concat(chunks)))
//         audioStream.on('error', err   => reject(err))
//     })
// }

// // ── Streaming TTS function ────────────────────────────────────────────────
// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned = cleanForSpeech(text)
//     const lang    = detectLanguage(cleaned)
//     const voiceId = options.voiceId || VOICE_MAP[lang] || VOICE_MAP.default

//     console.log(`[TTS] Streaming | Language: ${lang} | Voice: ${voiceId}`)

//     const tts = new MsEdgeTTS()
//     await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

//     return new Promise((resolve, reject) => {
//         const { audioStream } = tts.toStream(cleaned)
//         let total = 0

//         audioStream.on('data', chunk => {
//             const buf = Buffer.from(chunk)
//             total += buf.length
//             onChunk(buf)
//         })

//         audioStream.on('end', () => {
//             console.log(`[TTS] Streamed ${total} bytes — "${cleaned.slice(0, 50)}..."`)
//             onDone()
//             resolve()
//         })

//         audioStream.on('error', err => {
//             console.error('[TTS] Stream error:', err.message)
//             reject(err)
//         })
//     })
// }


// export function splitIntoSentences(text) {
//     return text
//         .replace(/([.!?।])\s+/g, '$1|||')
//         .split('|||')
//         .map(s => s.trim())
//         .filter(s => s.length > 2)
// }



// tts.js — Hugging Face AI TTS (free, no credit card)
// Uses Facebook MMS-TTS for Indian languages — actual AI, natural pronunciation
// Falls back to ElevenLabs for languages not supported by HF

// import { config } from '../config.js'

// const HF_API = 'https://api-inference.huggingface.co/models'

// // ── Hugging Face AI models per language ──────────────────────────────────
// // These are actual AI neural TTS models — not rule-based, truly natural
// const HF_MODELS = {
//     hindi:     'facebook/mms-tts-hin',   // Hindi — best natural AI
//     tamil:     'facebook/mms-tts-tam',   // Tamil
//     telugu:    'facebook/mms-tts-tel',   // Telugu
//     bengali:   'facebook/mms-tts-ben',   // Bengali
//     marathi:   'facebook/mms-tts-mar',   // Marathi
//     gujarati:  'facebook/mms-tts-guj',   // Gujarati
//     kannada:   'facebook/mms-tts-kan',   // Kannada
//     malayalam: 'facebook/mms-tts-mal',   // Malayalam
//     punjabi:   'facebook/mms-tts-pan',   // Punjabi
//     urdu:      'facebook/mms-tts-urd',   // Urdu
//     arabic:    'facebook/mms-tts-ara',   // Arabic
//     english:   'facebook/mms-tts-eng',   // English
//     hinglish:  'facebook/mms-tts-hin',   // Hinglish — use Hindi model
// }

// // ── Auto detect language ──────────────────────────────────────────────────
// function detectLanguage(text) {
//     if (/[\u0900-\u097F]/.test(text)) return 'hindi'
//     if (/[\u0600-\u06FF]/.test(text)) return 'arabic'
//     if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil'
//     if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu'
//     if (/[\u0980-\u09FF]/.test(text)) return 'bengali'
//     if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada'
//     if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam'
//     if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati'
//     if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi'
//     if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi'

//     // Hinglish detection
//     if (/\b(hai|hain|kya|nahi|aur|mein|se|ko|ka|ki|ho|tha|thi|aap|main|hum|tum|yeh|woh|kab|kaise|kitna|kyun|abhi|phir|bukhar|dard|dawai|theek)\b/i.test(text)) {
//         return 'hinglish'
//     }

//     return 'english'
// }

// // ── Clean text ────────────────────────────────────────────────────────────
// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// // ── HuggingFace TTS call ──────────────────────────────────────────────────
// async function callHuggingFace(text, lang) {
//     const model = HF_MODELS[lang] || HF_MODELS.english

//     console.log(`[TTS] HuggingFace | Lang: ${lang} | Model: ${model}`)

//     const response = await fetch(`${HF_API}/${model}`, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({ inputs: text }),
//     })

//     // Model loading — wait and retry
//     if (response.status === 503) {
//         console.log('[TTS] Model loading, waiting 10s...')
//         await new Promise(r => setTimeout(r, 10000))
//         return callHuggingFace(text, lang)
//     }

//     if (!response.ok) {
//         const err = await response.text().catch(() => '')
//         throw new Error(`HuggingFace TTS error ${response.status}: ${err}`)
//     }

//     const arrayBuffer = await response.arrayBuffer()
//     return Buffer.from(arrayBuffer)
// }

// // ── Main TTS (returns Buffer) ─────────────────────────────────────────────
// export async function textToSpeech(text, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned = cleanForSpeech(text)
//     const lang    = detectLanguage(cleaned)

//     return await callHuggingFace(cleaned, lang)
// }

// // ── Streaming TTS ─────────────────────────────────────────────────────────
// // HuggingFace doesn't support true streaming — get full audio then send
// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned = cleanForSpeech(text)
//     const lang    = detectLanguage(cleaned)

//     const audioBuffer = await callHuggingFace(cleaned, lang)

//     // Send in chunks of 4KB to simulate streaming
//     const chunkSize = 4096
//     for (let i = 0; i < audioBuffer.length; i += chunkSize) {
//         onChunk(audioBuffer.slice(i, i + chunkSize))
//     }

//     console.log(`[TTS] Sent ${audioBuffer.length} bytes — "${cleaned.slice(0, 50)}..."`)
//     onDone()
// }

// // ── Split into sentences ──────────────────────────────────────────────────
// export function splitIntoSentences(text) {
//     return text
//         .replace(/([.!?।])\s+/g, '$1|||')
//         .split('|||')
//         .map(s => s.trim())
//         .filter(s => s.length > 2)
// }


// import { KokoroTTS } from 'kokoro-js'
// import { config }    from '../config.js'

// // ── Language & Voice Map ──────────────────────────────────────────────────
// // Kokoro supports Hindi, English natively with natural prosody
// const VOICE_MAP = {
//     hindi:     'hf_alpha',   // best Hindi female voice in Kokoro
//     hinglish:  'hf_alpha',   // Hinglish — Hindi voice
//     english:   'af_sarah',   // natural English female
//     default:   'hf_alpha',   // fallback
// }

// // ── Singleton TTS instance ────────────────────────────────────────────────
// let ttsInstance = null
// async function getTTS() {
//     if (!ttsInstance) {
//         console.log('[TTS] Loading Kokoro model...')
//         ttsInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', {
//             dtype: 'q8', // quantized — faster on CPU
//         })
//         console.log('[TTS] Kokoro model loaded!')
//     }
//     return ttsInstance
// }

// // ── Auto detect language ──────────────────────────────────────────────────
// function detectLanguage(text) {
//     if (/[\u0900-\u097F]/.test(text)) return 'hindi'      // Devanagari
//     if (/[\u0600-\u06FF]/.test(text)) return 'hindi'      // Urdu/Arabic script — use Hindi
//     if (/[\u0B80-\u0BFF]/.test(text)) return 'english'    // Tamil — fallback English
//     if (/[\u0C00-\u0C7F]/.test(text)) return 'english'    // Telugu
//     if (/[\u0980-\u09FF]/.test(text)) return 'english'    // Bengali

//     // Hinglish detection
//     if (/\b(hai|hain|kya|nahi|aur|mein|se|ko|ka|ki|ho|tha|thi|aap|main|yeh|woh|kab|kaise|kitna|kyun|abhi|phir|bukhar|dard|dawai|theek)\b/i.test(text)) {
//         return 'hinglish'
//     }

//     return 'english'
// }

// // ── Clean text ────────────────────────────────────────────────────────────
// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// // ── Convert Float32 audio to MP3 Buffer ──────────────────────────────────
// function float32ToWavBuffer(float32Array, sampleRate = 24000) {
//     const numChannels = 1
//     const bitsPerSample = 16
//     const byteRate = sampleRate * numChannels * bitsPerSample / 8
//     const blockAlign = numChannels * bitsPerSample / 8
//     const dataSize = float32Array.length * 2
//     const buffer = Buffer.alloc(44 + dataSize)

//     // WAV header
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

//     // Convert float32 to int16
//     for (let i = 0; i < float32Array.length; i++) {
//         const s = Math.max(-1, Math.min(1, float32Array[i]))
//         buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2)
//     }

//     return buffer
// }

// // ── Main TTS (returns Buffer) ─────────────────────────────────────────────
// export async function textToSpeech(text, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned = cleanForSpeech(text)
//     const lang    = detectLanguage(cleaned)
//     const voice   = options.voiceId || VOICE_MAP[lang] || VOICE_MAP.default

//     console.log(`[TTS] Kokoro | Lang: ${lang} | Voice: ${voice}`)

//     const tts    = await getTTS()
//     const result = await tts.generate(cleaned, { voice })
//     return float32ToWavBuffer(result.audio, result.sampling_rate || 24000)
// }

// // ── Streaming TTS ─────────────────────────────────────────────────────────
// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')

//     const cleaned = cleanForSpeech(text)
//     const lang    = detectLanguage(cleaned)
//     const voice   = options.voiceId || VOICE_MAP[lang] || VOICE_MAP.default

//     console.log(`[TTS] Kokoro Stream | Lang: ${lang} | Voice: ${voice}`)

//     const tts         = await getTTS()
//     const result      = await tts.generate(cleaned, { voice })
//     const audioBuffer = float32ToWavBuffer(result.audio, result.sampling_rate || 24000)

//     // Send in 4KB chunks
//     const chunkSize = 4096
//     for (let i = 0; i < audioBuffer.length; i += chunkSize) {
//         onChunk(audioBuffer.slice(i, i + chunkSize))
//     }

//     console.log(`[TTS] Sent ${audioBuffer.length} bytes — "${cleaned.slice(0, 50)}..."`)
//     onDone()
// }

// // ── Split into sentences ──────────────────────────────────────────────────
// export function splitIntoSentences(text) {
//     return text
//         .replace(/([.!?।])\s+/g, '$1|||')
//         .split('|||')
//         .map(s => s.trim())
//         .filter(s => s.length > 2)
// }

import { KokoroTTS } from 'kokoro-js'

// ── Singleton TTS instance ────────────────────────────────────────────────
let ttsInstance = null
async function getTTS() {
    if (!ttsInstance) {
        console.log('[TTS] Loading Kokoro model...')
        ttsInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', {
            dtype: 'q8',
        })
        console.log('[TTS] Kokoro model loaded!')
    }
    return ttsInstance
}

// ── Voice — af_heart is best quality female (Grade A) ────────────────────
// Kokoro only has English voices — but af_heart handles Hinglish naturally
// It won't sound Indian but will pronounce Hindi words correctly
const DEFAULT_VOICE = 'af_heart'

// ── Clean text ────────────────────────────────────────────────────────────
function cleanForSpeech(text) {
    return text
        .replace(/[*_`#~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500)
}

// ── Convert Float32 audio to WAV Buffer ───────────────────────────────────
function float32ToWavBuffer(float32Array, sampleRate = 24000) {
    const numChannels   = 1
    const bitsPerSample = 16
    const byteRate      = sampleRate * numChannels * bitsPerSample / 8
    const blockAlign    = numChannels * bitsPerSample / 8
    const dataSize      = float32Array.length * 2
    const buffer        = Buffer.alloc(44 + dataSize)

    buffer.write('RIFF', 0)
    buffer.writeUInt32LE(36 + dataSize, 4)
    buffer.write('WAVE', 8)
    buffer.write('fmt ', 12)
    buffer.writeUInt32LE(16, 16)
    buffer.writeUInt16LE(1, 20)
    buffer.writeUInt16LE(numChannels, 22)
    buffer.writeUInt32LE(sampleRate, 24)
    buffer.writeUInt32LE(byteRate, 28)
    buffer.writeUInt16LE(blockAlign, 32)
    buffer.writeUInt16LE(bitsPerSample, 34)
    buffer.write('data', 36)
    buffer.writeUInt32LE(dataSize, 40)

    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]))
        buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2)
    }

    return buffer
}

// ── Main TTS (returns Buffer) ─────────────────────────────────────────────
export async function textToSpeech(text, options = {}) {
    if (!text?.trim()) throw new Error('TTS: No text provided')

    const cleaned = cleanForSpeech(text)
    const voice   = options.voiceId || DEFAULT_VOICE

    console.log(`[TTS] Kokoro | Voice: ${voice} | "${cleaned.slice(0, 50)}"`)

    const tts    = await getTTS()
    const result = await tts.generate(cleaned, { voice })
    return float32ToWavBuffer(result.audio, result.sampling_rate || 24000)
}

// ── Streaming TTS ─────────────────────────────────────────────────────────
export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
    if (!text?.trim()) throw new Error('TTS: No text provided')

    const cleaned = cleanForSpeech(text)
    const voice   = options.voiceId || DEFAULT_VOICE

    console.log(`[TTS] Kokoro Stream | Voice: ${voice} | "${cleaned.slice(0, 50)}"`)

    const tts         = await getTTS()
    const result      = await tts.generate(cleaned, { voice })
    const audioBuffer = float32ToWavBuffer(result.audio, result.sampling_rate || 24000)

    const chunkSize = 4096
    for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        onChunk(audioBuffer.slice(i, i + chunkSize))
    }

    console.log(`[TTS] Sent ${audioBuffer.length} bytes`)
    onDone()
}

// ── Split into sentences ──────────────────────────────────────────────────
export function splitIntoSentences(text) {
    return text
        .replace(/([.!?।])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 2)
}