// import fetch from 'node-fetch'

// const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
// const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'

// function cleanForSpeech(text) {
//     return text
//         .replace(/[*_`#~]/g, '')
//         .replace(/https?:\/\/\S+/g, '')
//         .replace(/\n+/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .slice(0, 500)
// }

// export async function textToSpeech(text, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')
//     const cleaned = cleanForSpeech(text)
//     const voiceId = options.voiceId || VOICE_ID

//     console.log(`[TTS] ElevenLabs | "${cleaned.slice(0, 50)}"`)

//     const response = await fetch(
//         `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
//         {
//             method: 'POST',
//             headers: {
//                 'xi-api-key': ELEVENLABS_API_KEY,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 text: cleaned,
//                 model_id:'eleven_multilingual_v2',
//                 voice_settings: {
//                     stability: 0.5,
//                     similarity_boost: 0.75
//                 }
//             })
//         }
//     )

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`ElevenLabs error: ${err}`)
//     }

//     const arrayBuffer = await response.arrayBuffer()
//     return Buffer.from(arrayBuffer)
// }

// export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
//     if (!text?.trim()) throw new Error('TTS: No text provided')
//     const cleaned = cleanForSpeech(text)
//     const voiceId = options.voiceId || VOICE_ID

//     console.log(`[TTS] ElevenLabs Stream | "${cleaned.slice(0, 50)}"`)

//     const response = await fetch(
//         `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
//         {
//             method: 'POST',
//             headers: {
//                 'xi-api-key': ELEVENLABS_API_KEY,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 text: cleaned,
//                 model_id: 'eleven_monolingual_v1',
//                 voice_settings: {
//                     stability: 0.5,
//                     similarity_boost: 0.75
//                 }
//             })
//         }
//     )

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`ElevenLabs error: ${err}`)
//     }

//     response.body.on('data', chunk => onChunk(chunk))
//     response.body.on('end', () => {
//         console.log('[TTS] Stream done')
//         onDone()
//     })
//     response.body.on('error', (err) => {
//         console.error('[TTS] Stream error:', err)
//         onDone()
//     })
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
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // ✅ Rachel - free, Hindi+English female

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

    console.log(`[TTS] ElevenLabs | "${cleaned.slice(0, 50)}"`)

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
                model_id: 'eleven_multilingual_v2', // ✅ already sahi tha
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        }
    )

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`ElevenLabs error: ${err}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

export async function streamTextToSpeech(text, onChunk, onDone = () => {}, options = {}) {
    if (!text?.trim()) throw new Error('TTS: No text provided')
    const cleaned = cleanForSpeech(text)
    const voiceId = options.voiceId || VOICE_ID

    console.log(`[TTS] ElevenLabs Stream | "${cleaned.slice(0, 50)}"`)

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
                model_id: 'eleven_multilingual_v2', // ✅ FIX - monolingual_v1 tha
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        }
    )

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`ElevenLabs error: ${err}`)
    }

    response.body.on('data', chunk => onChunk(chunk))
    response.body.on('end', () => {
        console.log('[TTS] Stream done')
        onDone()
    })
    response.body.on('error', (err) => {
        console.error('[TTS] Stream error:', err)
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