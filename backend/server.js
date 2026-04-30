import express    from 'express'
import http       from 'http'
import cors       from 'cors'
import { Server } from 'socket.io'
import dotenv     from 'dotenv'

import { config }                       from './src/config.js'
import { initRNNoise, removeNoise }     from './src/noise.js'
import { Transcriber }                  from './src/assembly.js'
import { AudioQueue }                   from './src/queue.js'
import { runDoctorAgent, clearSession } from './src/langchain/agent.js'
import { textToSpeech, streamTextToSpeech, splitIntoSentences } from './src/services/tts.js'
import {
    getAuthUrl,
    saveToken,
    isAuthenticated,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    CalendarAuthError,
    SlotConflictError,
    BookingError,
} from './src/services/calendar.js'
import { sendDoctorEmail, sendPatientEmail } from './src/services/email.js'
import appointmentRouter from './src/routes/appointments.js'
dotenv.config()

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
    cors: { origin: config.corsOrigin || '*' },
    maxHttpBufferSize: config.maxChunkSize,
})

app.use(cors())
app.use(express.json({ limit: '10kb' }))

const rateLimits = new Map()
function rateLimit(windowMs = 60_000, maxRequests = 20) {
    return (req, res, next) => {
        const key  = req.ip
        const now  = Date.now()
        const hits = (rateLimits.get(key) || []).filter(t => now - t < windowMs)
        hits.push(now)
        rateLimits.set(key, hits)
        if (hits.length > maxRequests) return res.status(429).json({ error: 'Too many requests.' })
        next()
    }
}
setInterval(() => {
    const cutoff = Date.now() - 60_000
    for (const [k, v] of rateLimits) {
        const fresh = v.filter(t => t > cutoff)
        if (!fresh.length) rateLimits.delete(k)
        else rateLimits.set(k, fresh)
    }
}, 5 * 60_000)

function validateBookSlot({ slotStart, slotEnd, patientName }) {
    if (!slotStart || !slotEnd || !patientName)               return 'Missing slotStart, slotEnd, or patientName'
    if (typeof patientName !== 'string' || patientName.trim().length < 2) return 'Invalid patient name'
    if (isNaN(new Date(slotStart)) || isNaN(new Date(slotEnd)))           return 'Invalid slot times'
    if (new Date(slotStart) >= new Date(slotEnd))                          return 'slotEnd must be after slotStart'
    if (new Date(slotStart) < new Date())                                  return 'Cannot book a past slot'
    return null
}

app.get('/health', (req, res) => res.json({
    status: 'ok', uptime: Math.floor(process.uptime()),
    calendarAuth: isAuthenticated(), timestamp: new Date().toISOString(),
}))

app.get('/auth/google', rateLimit(60_000, 5), (req, res) => {
    console.log('[Auth] Redirecting to Google OAuth')
    res.redirect(getAuthUrl())
})
app.use('/api/appointments', appointmentRouter)

app.get('/auth/callback', async (req, res) => {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'No auth code provided' })
    try {
        await saveToken(code)
        console.log('[Auth] Google Calendar authorized')
        res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <h2> Google Calendar Connected!</h2>
            <p>You can close this tab.</p></body></html>`)
    } catch (err) {
        res.status(500).json({ error: 'Authentication failed', detail: err.message })
    }
})

const connectionCounts = new Map()
const MAX_CONNS_PER_IP = 3

io.on('connection', async (socket) => {
    const clientIp = socket.handshake.address
    const ipCount  = (connectionCounts.get(clientIp) || 0) + 1
    connectionCounts.set(clientIp, ipCount)

    if (ipCount > MAX_CONNS_PER_IP) {
        socket.emit('error', { message: 'Too many connections from your network.' })
        socket.disconnect(true)
        return
    }

    console.log(`[Server] Connected: ${socket.id} (${clientIp})`)

    let patientSymptoms   = ''
    let patientName       = ''
    let patientEmail      = ''
    let selectedDoctor    = null
    let lastBookedEventId = null
    let isSpeaking        = false

    async function speakToClient(text, options = {}) {
        if (!text?.trim()) return
        const sentences = splitIntoSentences(text)
        if (!sentences.length) return
        isSpeaking = true
        socket.emit('tts-start')
        try {
            for (const sentence of sentences) {
                if (!sentence.trim()) continue
                await streamTextToSpeech(
                    sentence,
                    (chunk) => { socket.emit('tts-audio', chunk) },
                    () => {},
                    options
                )
            }
        } catch (err) {
            console.error(`[TTS] Error for ${socket.id}:`, err.message)
            socket.emit('tts-error', { message: 'Voice generation failed.' })
        } finally {
            isSpeaking = false
            socket.emit('tts-end')
        }
    }

    // ✅ FIXED handleTranscript
    // Text reply aur doctor cards TURANT bhejo
    // TTS background mein chalao — await nahi karo
    async function handleTranscript(transcript) {
        if (!transcript?.trim()) return
        try {
            const { reply, doctors } = await runDoctorAgent(transcript, socket.id)

            // ✅ Step 1 — Turant text reply bhejo
            socket.emit('doctor-response', reply)

            // ✅ Step 2 — Doctor cards turant bhejo (TTS ka wait nahi)
            if (doctors && doctors.length > 0) {
                selectedDoctor = doctors[0]
                socket.emit('show-appointment-btn', {
                    doctors: doctors.map(d => ({
                        name:           d.name,
                        specialization: d.specialization,
                        fee:            d.fee,
                        experience:     d.experience,
                    }))
                })
                console.log(`[Server] Sent ${doctors.length} doctor cards to ${socket.id}`)
            }

            // ✅ Step 3 — TTS background mein chalao, connection block nahi hoga
            speakToClient(reply).catch(err => {
                console.error(`[TTS] Background speak error (${socket.id}):`, err.message)
                socket.emit('tts-error', { message: 'Voice generation failed.' })
            })

        } catch (err) {
            console.error(`[Server] Agent error (${socket.id}):`, err.message)
            const errMsg = err.message || 'Doctor agent failed. Please try again.'
            socket.emit('error', { message: errMsg })
        }
    }

    const transcriber = new Transcriber(
        socket.id,
        async (transcript) => {
            socket.emit('transcript', transcript)
            patientSymptoms += ' ' + transcript
            await handleTranscript(transcript)
        },
        (err) => {
            console.error(`[Server] Transcription error (${socket.id}):`, err.message)
            socket.emit('error', { message: 'Transcription error. Please reconnect.' })
        },
        (partialText) => {
            socket.emit('transcript-partial', partialText)
        }
    )

    const queue = new AudioQueue(socket.id, async (audioChunk) => {
        if (isSpeaking) return
        const cleanAudio = removeNoise(Buffer.from(audioChunk))
        await transcriber.sendAudio(cleanAudio)
    })

    try {
        await transcriber.connect()
        socket.emit('ready')
    } catch (err) {
        console.error(`[Server] AssemblyAI connect failed (${socket.id}):`, err.message)
        socket.emit('error', { message: 'Failed to start transcription.' })
        socket.disconnect(true)
        return
    }

    socket.on('audio-stream', (audioChunk) => {
        if (!Buffer.isBuffer(audioChunk) && !(audioChunk instanceof Uint8Array)) return
        if (audioChunk.length === 0 || audioChunk.length > config.maxChunkSize)  return
        if (audioChunk.length % 2 !== 0) return
        queue.push(audioChunk)
    })

    socket.on('end-utterance', async () => {
        await transcriber.forceEndUtterance()
    })

    socket.on('tts-done-playing', () => {
        isSpeaking = false
    })

    socket.on('text-message', async (text) => {
        if (typeof text !== 'string' || !text.trim()) return
        if (text.length > 1000) {
            socket.emit('error', { message: 'Message too long (max 1000 chars).' })
            return
        }
        const safeText = text.trim()
        socket.emit('transcript', safeText)
        patientSymptoms += ' ' + safeText
        await handleTranscript(safeText)
    })

    socket.on('set-patient-info', ({ name, email } = {}) => {
        if (typeof name === 'string' && name.trim().length >= 2) {
            patientName = name.trim().slice(0, 100)
        }
        if (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            patientEmail = email.trim()
        }
        console.log(`[Server] Patient info set: ${patientName} <${patientEmail}> (${socket.id})`)
    })

    socket.on('get-slots', async (options = {}) => {
        if (!isAuthenticated()) {
            socket.emit('error', { message: 'Doctor calendar not connected yet.', code: 'AUTH_REQUIRED' })
            return
        }
        try {
            const slots = await getAvailableSlots({
                daysAhead:    options.daysAhead    || 7,
                slotDuration: options.slotDuration || 30,
                maxSlots:     Math.min(options.maxSlots || 15, 30),
            })
            socket.emit('available-slots', { slots, count: slots.length })
            if (slots.length > 0) {
                const spoken = slots.slice(0, 3).map(s => s.display).join(', ya phir ')
                speakToClient(`Yeh slots available hain: ${spoken}. Kaun sa time aapke liye theek rahega?`).catch(console.error)
            } else {
                speakToClient('Is hafte koi slot available nahi hai. Baad mein try karein.').catch(console.error)
            }
        } catch (err) {
            console.error('[Server] Slots error:', err.message)
            socket.emit('error', { message: 'Could not fetch available slots.' })
        }
    })

    socket.on('book-slot', async ({ slotStart, slotEnd, patientName: nameOverride, patientEmail: emailOverride }) => {
    const name  = nameOverride?.trim()  || patientName  || 'Patient'
    const email = emailOverride?.trim() || patientEmail || null
 
    const validationError = validateBookSlot({ slotStart, slotEnd, patientName: name })
    if (validationError) {
        socket.emit('error', { message: validationError })
        return
    }
    if (!isAuthenticated()) {
        socket.emit('error', { message: 'Doctor calendar not connected.', code: 'AUTH_REQUIRED' })
        return
    }
    try {
        const confirmation = await bookAppointment({
            patientName:  name,
            patientEmail: email,
            doctorName:   selectedDoctor?.name || 'Doctor',
            symptoms:     patientSymptoms.trim().slice(0, 500),
            slotStart,
            slotEnd,
        })
 
        lastBookedEventId = confirmation.eventId
 
        const confirmMsg = `Aapki appointment confirm ho gayi! ${confirmation.doctorName} ke saath ${new Date(confirmation.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} ko milenge.`
 
        socket.emit('appointment-confirmed', {
            message:   confirmMsg,
            doctor:    confirmation.doctorName,
            patient:   confirmation.patientName,
            time:      new Date(confirmation.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            eventLink: confirmation.eventLink,
            eventId:   confirmation.eventId,
        })
 
        speakToClient(confirmMsg).catch(console.error)
 
        // ── Email bhejo dono ko (background mein) ────────────────
        const doctorEmail = selectedDoctor?.email || null
        const doctorSpec  = selectedDoctor?.specialization || ''
 
        // Dr. ko email
        sendDoctorEmail({
            doctorName:   selectedDoctor?.name || 'Doctor',
            doctorEmail,
            patientName:  name,
            patientEmail: email,
            symptoms:     patientSymptoms.trim().slice(0, 500),
            slotStart,
            slotEnd,
        }).catch(err => console.error('[Email] Doctor email error:', err.message))
 
        // Patient ko email
        sendPatientEmail({
            patientName:          name,
            patientEmail:         email,
            doctorName:           selectedDoctor?.name || 'Doctor',
            doctorSpecialization: doctorSpec,
            symptoms:             patientSymptoms.trim().slice(0, 500),
            slotStart,
            slotEnd,
            eventLink:            confirmation.eventLink,
        }).catch(err => console.error('[Email] Patient email error:', err.message))
 
    } catch (err) {
        console.error('[Server] Booking error:', err.message)
        const code = err instanceof SlotConflictError ? 'SLOT_CONFLICT'
                   : err instanceof CalendarAuthError ? 'AUTH_REQUIRED'
                   : 'BOOKING_FAILED'
        socket.emit('error', { message: err.message, code })
    }
})
 

    socket.on('cancel-appointment', async ({ eventId } = {}) => {
        const id = eventId || lastBookedEventId
        if (!id) {
            socket.emit('error', { message: 'No appointment to cancel.' })
            return
        }
        try {
            await cancelAppointment(id)
            const msg = 'Aapki appointment cancel ho gayi hai.'
            socket.emit('appointment-cancelled', { message: msg, eventId: id })
            speakToClient(msg).catch(console.error)
            if (id === lastBookedEventId) lastBookedEventId = null
        } catch (err) {
            socket.emit('error', { message: err.message || 'Could not cancel appointment.' })
        }
    })

    socket.on('disconnect', async (reason) => {
        console.log(`[Server] Disconnected: ${socket.id} — ${reason}`)
        const count = connectionCounts.get(clientIp) || 1
        if (count <= 1) connectionCounts.delete(clientIp)
        else connectionCounts.set(clientIp, count - 1)
        queue.destroy()
        clearSession(socket.id)
        await transcriber.close()
    })

    socket.on('error', (err) => {
        console.error(`[Server] Socket error (${socket.id}):`, err.message)
    })
})

function shutdown(signal) {
    console.log(`[Server] ${signal} — shutting down`)
    io.close()
    server.close(() => { console.log('[Server] Done'); process.exit(0) })
    setTimeout(() => process.exit(1), 10_000)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('uncaughtException',  (err) => { console.error('[Server] Uncaught:', err);    process.exit(1) })
process.on('unhandledRejection', (err) => { console.error('[Server] Unhandled:', err) })

async function start() {
    try {
        await initRNNoise()
        console.log('[TTS] Edge TTS ready!')  
        if (!isAuthenticated()) {
            console.log('[Calendar]   Not authorized. Visit http://localhost:' + config.port + '/auth/google')
        } else {
            console.log('[Calendar]  Google Calendar connected')
        }
        server.listen(config.port, () => console.log(`[Server] Running on http://localhost:${config.port}`))
    } catch (err) {
        console.error('[Server] Failed to start:', err.message)
        process.exit(1)
    }
}

start()