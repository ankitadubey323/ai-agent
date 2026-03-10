// src/langchain/agent.js
// Flow:
// transcript → collect symptoms (1-2 follow-up questions)
//           → search Pinecone for matching doctors
//           → Groq formats response with doctor suggestions
//           → returns { reply, showAppointmentBtn, doctors }

import { ChatGroq }                            from '@langchain/groq'
import { doctorPrompt }                        from '../../socket/prompt.js'
import { getMemory, addToMemory, clearMemory }  from './memory.js'
import { searchDoctors }                       from './pinecone.js'
import { config }                              from '../config.js'

// ─── LLM Setup ────────────────────────────────────────────────────────────────
// WHY llama-3.3-70b-versatile?
// llama-3.1-8b-instant is trained mostly on English + Hindi.
// For Arabic, Tamil, Bengali, Urdu etc. it fails or replies in English.
// llama-3.3-70b-versatile has strong multilingual support across 30+ languages
// including Arabic, Persian, Turkish, French, Spanish, Bengali, Tamil etc.
// It's still free on Groq and fast enough for real-time voice use.
const llm = new ChatGroq({
    apiKey:      config.groqApiKey,
    model:       'llama-3.3-70b-versatile',   // ← changed from llama-3.1-8b-instant
    temperature: 0.85,                         // ← slightly higher for more natural replies
    maxTokens:   512,
})

const chain = doctorPrompt.pipe(llm)

// ─── Session State ────────────────────────────────────────────────────────────
const sessions = new Map() // socketId → { turnCount, symptomsBuffer, lastDoctors, detectedLanguage }

function getSession(socketId) {
    if (!sessions.has(socketId)) {
        sessions.set(socketId, {
            turnCount:        0,
            symptomsBuffer:   '',
            lastDoctors:      [],
            detectedLanguage: null, // track language per session
        })
    }
    return sessions.get(socketId)
}

// ─── Language Detection (lightweight, no API needed) ─────────────────────────
// Detects script/language from user input to reinforce the prompt
function detectLanguageHint(text) {
    if (!text) return ''

    const arabicRegex    = /[\u0600-\u06FF]/
    const hebrewRegex    = /[\u0590-\u05FF]/
    const devanagariRegex = /[\u0900-\u097F]/
    const bengaliRegex   = /[\u0980-\u09FF]/
    const tamilRegex     = /[\u0B80-\u0BFF]/
    const teluguRegex    = /[\u0C00-\u0C7F]/
    const chineseRegex   = /[\u4E00-\u9FFF]/
    const japaneseRegex  = /[\u3040-\u309F\u30A0-\u30FF]/
    const koreanRegex    = /[\uAC00-\uD7AF]/
    const cyrillicRegex  = /[\u0400-\u04FF]/

    if (arabicRegex.test(text))     return 'Reply ONLY in Arabic (العربية). Do not use any other language.'
    if (hebrewRegex.test(text))     return 'Reply ONLY in Hebrew (עברית). Do not use any other language.'
    if (devanagariRegex.test(text)) return 'Reply ONLY in Hindi (हिंदी). Do not use any other language.'
    if (bengaliRegex.test(text))    return 'Reply ONLY in Bengali (বাংলা). Do not use any other language.'
    if (tamilRegex.test(text))      return 'Reply ONLY in Tamil (தமிழ்). Do not use any other language.'
    if (teluguRegex.test(text))     return 'Reply ONLY in Telugu (తెలుగు). Do not use any other language.'
    if (chineseRegex.test(text))    return 'Reply ONLY in Chinese (中文). Do not use any other language.'
    if (japaneseRegex.test(text))   return 'Reply ONLY in Japanese (日本語). Do not use any other language.'
    if (koreanRegex.test(text))     return 'Reply ONLY in Korean (한국어). Do not use any other language.'
    if (cyrillicRegex.test(text))   return 'Reply ONLY in Russian (Русский). Do not use any other language.'

    // Latin script — could be English, Spanish, French, Hinglish etc.
    // Let the model figure it out from context
    return 'Detect the exact language/dialect from user message and reply in the SAME language.'
}

// ─── Retry Helper ─────────────────────────────────────────────────────────────
async function withRetry(fn, retries = 2, delayMs = 500) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (err) {
            const isLast = attempt === retries
            if (isLast) throw err

            const isRetryable = err.status === 429 || err.status >= 500 || err.code === 'ECONNRESET'
            if (!isRetryable) throw err

            const wait = delayMs * Math.pow(2, attempt)
            console.warn(`[Agent] Retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`)
            await new Promise(r => setTimeout(r, wait))
        }
    }
}

// ─── Symptom Threshold ────────────────────────────────────────────────────────
const MIN_TURNS_BEFORE_SEARCH = 2
const MIN_SYMPTOM_WORDS       = 5

function hasEnoughContext(session) {
    return (
        session.turnCount >= MIN_TURNS_BEFORE_SEARCH ||
        session.symptomsBuffer.trim().split(/\s+/).length >= MIN_SYMPTOM_WORDS
    )
}

// ─── Main Agent Function ──────────────────────────────────────────────────────
/**
 * @param {string} transcript - user message
 * @param {string} socketId   - unique per connected user
 * @returns {Promise<{
 *   reply: string,
 *   showAppointmentBtn: boolean,
 *   doctors: Array
 * }>}
 */
export async function runDoctorAgent(transcript, socketId) {
    if (!transcript?.trim()) {
        return { reply: 'Kripya apni problem batayein.', showAppointmentBtn: false, doctors: [] }
    }

    console.log(`[Agent] Input (${socketId}): "${transcript}"`)

    const session = getSession(socketId)
    session.turnCount++
    session.symptomsBuffer += ' ' + transcript

    // Detect language from current message
    const languageHint = detectLanguageHint(transcript)
    console.log(`[Agent] Language hint: ${languageHint}`)

    const history = getMemory(socketId)

    let doctors       = session.lastDoctors
    let doctorContext = ''

    if (hasEnoughContext(session)) {
        try {
            const freshDoctors = await withRetry(() =>
                searchDoctors(session.symptomsBuffer.trim(), 2)
            )

            if (freshDoctors.length > 0) {
                doctors             = freshDoctors
                session.lastDoctors = freshDoctors

                doctorContext = `\n\nBased on symptoms, these doctors are available:\n` +
                    freshDoctors.map((d, i) =>
                        `${i + 1}. ${d.name} (${d.specialization}) - ₹${d.fee} - ${d.experience}`
                    ).join('\n')

                console.log(`[Agent] Found ${freshDoctors.length} doctors for ${socketId}`)
            }
        } catch (err) {
            console.error(`[Agent] Pinecone search failed (${socketId}):`, err.message)
        }
    }

    let reply
    try {
        // Inject language hint directly into the user input so model respects it
        const inputWithLangHint = `[LANGUAGE INSTRUCTION: ${languageHint}]\n\nUser message: ${transcript}${doctorContext}`

        const response = await withRetry(() =>
            chain.invoke({
                input:          inputWithLangHint,
                history,
                suggestDoctors: doctors.length > 0,
            })
        )
        reply = response.content?.trim() || 'Kuch technical issue hai. Please dobara try karein.'
    } catch (err) {
        console.error(`[Agent] LLM failed for ${socketId}:`, err.message)
        throw new Error('Doctor agent unavailable. Please try again in a moment.')
    }

    console.log(`[Agent] Response (${socketId}): "${reply}"`)
    addToMemory(socketId, transcript, reply)

    return {
        reply,
        showAppointmentBtn: doctors.length > 0,
        doctors,
    }
}

export function clearSession(socketId) {
    sessions.delete(socketId)
    clearMemory(socketId)
    console.log(`[Agent] Session cleared: ${socketId}`)
}

export { clearMemory }