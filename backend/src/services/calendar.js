// src/services/calendar.js
// Production-ready Google Calendar service
//   - OAuth2 with auto token refresh
//   - Slot fetching with configurable range & duration
//   - Double-check conflict before booking
//   - Patient email invite support
//   - Structured error types

import { google }            from 'googleapis'
import { config }            from '../config.js'
import fs                    from 'fs'
import path                  from 'path'
import { fileURLToPath }     from 'url'

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_PATH = path.join(__dirname, '../../token.json')

// ─── Custom Errors ────────────────────────────────────────────────────────────
export class CalendarAuthError  extends Error { constructor(msg) { super(msg); this.name = 'CalendarAuthError'  } }
export class SlotConflictError  extends Error { constructor(msg) { super(msg); this.name = 'SlotConflictError'  } }
export class BookingError       extends Error { constructor(msg) { super(msg); this.name = 'BookingError'       } }

// ─── OAuth2 Client ────────────────────────────────────────────────────────────
export function getOAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        config.googleRedirectUri,
    )

    if (fs.existsSync(TOKEN_PATH)) {
        try {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
            oauth2Client.setCredentials(token)

            // Persist refreshed tokens automatically
            oauth2Client.on('tokens', (tokens) => {
                try {
                    const current = fs.existsSync(TOKEN_PATH)
                        ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
                        : {}
                    const merged  = { ...current, ...tokens }
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2))
                    console.log('[Calendar] Token refreshed and saved')
                } catch (e) {
                    console.error('[Calendar] Failed to persist refreshed token:', e.message)
                }
            })
        } catch (e) {
            console.error('[Calendar] Corrupt token file — re-auth required:', e.message)
            fs.unlinkSync(TOKEN_PATH)
        }
    }

    return oauth2Client
}

// ─── Auth URL ─────────────────────────────────────────────────────────────────
export function getAuthUrl() {
    const oauth2Client = getOAuthClient()
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ],
        prompt: 'consent',
    })
}

// ─── Save Token ───────────────────────────────────────────────────────────────
export async function saveToken(code) {
    if (!code || typeof code !== 'string') throw new CalendarAuthError('Invalid auth code')

    const oauth2Client     = getOAuthClient()
    const { tokens }       = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
    console.log('[Calendar] Token saved to', TOKEN_PATH)
    return tokens
}

// ─── Auth Check ───────────────────────────────────────────────────────────────
export function isAuthenticated() {
    if (!fs.existsSync(TOKEN_PATH)) return false
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
        return !!(token.access_token || token.refresh_token)
    } catch {
        return false
    }
}

// ─── Fetch Busy Intervals ─────────────────────────────────────────────────────
async function getBusyIntervals(calendar, timeMin, timeMax) {
    const res = await calendar.freebusy.query({
        requestBody: {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            items:   [{ id: config.doctorCalendarId }],
        },
    })
    return res.data.calendars?.[config.doctorCalendarId]?.busy || []
}

// ─── Get Available Slots ──────────────────────────────────────────────────────
/**
 * @param {object} options
 * @param {number} options.daysAhead      - how many days to look ahead (default 7)
 * @param {number} options.slotDuration   - minutes per slot (default 30)
 * @param {number} options.maxSlots       - max slots to return (default 15)
 * @param {number} options.startHour      - clinic open hour (default 9)
 * @param {number} options.endHour        - clinic close hour (default 17)
 * @returns {Promise<Array>}
 */
export async function getAvailableSlots({
    daysAhead    = 7,
    slotDuration = 30,
    maxSlots     = 15,
    startHour    = 9,
    endHour      = 17,
} = {}) {
    if (!isAuthenticated()) throw new CalendarAuthError('Not authenticated with Google Calendar')

    const auth     = getOAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })

    const now      = new Date()
    const timeMax  = new Date()
    timeMax.setDate(timeMax.getDate() + daysAhead)

    // Use freebusy API — more efficient than listing all events
    const busyIntervals = await getBusyIntervals(calendar, now, timeMax)

    const slots = []

    for (let day = 0; day < daysAhead && slots.length < maxSlots; day++) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        date.setHours(startHour, 0, 0, 0)

        // Skip Sundays (0)
        if (date.getDay() === 0) continue

        for (let hour = startHour; hour < endHour && slots.length < maxSlots; hour++) {
            for (const min of [0, slotDuration === 60 ? 0 : 30]) {
                if (slotDuration === 60 && min === 30) continue

                const slotStart = new Date(date)
                slotStart.setHours(hour, min, 0, 0)
                const slotEnd = new Date(slotStart)
                slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

                // Skip past slots (with 5 min buffer)
                if (slotStart < new Date(Date.now() + 5 * 60 * 1000)) continue

                // Check against busy intervals
                const isBooked = busyIntervals.some(({ start, end }) => {
                    const bStart = new Date(start)
                    const bEnd   = new Date(end)
                    return slotStart < bEnd && slotEnd > bStart
                })

                if (!isBooked) {
                    slots.push({
                        start:   slotStart.toISOString(),
                        end:     slotEnd.toISOString(),
                        display: slotStart.toLocaleString('en-IN', {
                            weekday: 'short',
                            month:   'short',
                            day:     'numeric',
                            hour:    '2-digit',
                            minute:  '2-digit',
                            timeZone: 'Asia/Kolkata',
                        }),
                    })
                }

                if (slots.length >= maxSlots) break
            }
        }
    }

    return slots
}

// ─── Book Appointment ─────────────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {string} params.patientName
 * @param {string} params.patientEmail  - optional, for calendar invite
 * @param {string} params.doctorName
 * @param {string} params.symptoms
 * @param {string} params.slotStart     - ISO string
 * @param {string} params.slotEnd       - ISO string
 * @returns {Promise<object>}
 */
export async function bookAppointment({ patientName, patientEmail, doctorName, symptoms, slotStart, slotEnd }) {
    // Input validation
    if (!patientName || !slotStart || !slotEnd) throw new BookingError('Missing required booking fields')
    if (!isAuthenticated()) throw new CalendarAuthError('Not authenticated with Google Calendar')

    const start = new Date(slotStart)
    const end   = new Date(slotEnd)

    if (isNaN(start) || isNaN(end))   throw new BookingError('Invalid slot times')
    if (start >= end)                  throw new BookingError('Slot end must be after start')
    if (start < new Date())            throw new BookingError('Cannot book a slot in the past')

    const auth     = getOAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })

    // ── Double-check slot is still free before booking ────────────────────────
    const busy = await getBusyIntervals(calendar, start, end)
    if (busy.length > 0) throw new SlotConflictError('This slot was just taken. Please choose another.')

    // ── Build attendees list ──────────────────────────────────────────────────
    const attendees = []
    if (patientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
        attendees.push({ email: patientEmail, displayName: patientName })
    }

    // ── Create event ──────────────────────────────────────────────────────────
    const event = {
        summary:     `Patient Appointment — ${patientName}`,
        description: [
            `Doctor: ${doctorName}`,
            `Patient: ${patientName}`,
            `Symptoms: ${symptoms || 'Not specified'}`,
            `Booked via: AI Doctor Agent`,
            `Booked at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        ].join('\n'),
        start: { dateTime: slotStart, timeZone: 'Asia/Kolkata' },
        end:   { dateTime: slotEnd,   timeZone: 'Asia/Kolkata' },
        attendees,
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 60  },
                { method: 'popup', minutes: 15  },
            ],
        },
        // Prevent attendees from modifying
        guestsCanModify: false,
        guestsCanSeeOtherGuests: false,
    }

    let response
    try {
        response = await calendar.events.insert({
            calendarId:          config.doctorCalendarId,
            resource:            event,
            sendNotifications:   attendees.length > 0,
        })
    } catch (err) {
        console.error('[Calendar] Event insert failed:', err.message)
        throw new BookingError('Failed to create calendar event: ' + err.message)
    }

    const created = response.data
    console.log(`[Calendar] Appointment booked: ${created.htmlLink}`)

    return {
        eventId:     created.id,
        eventLink:   created.htmlLink,
        start:       created.start.dateTime,
        end:         created.end.dateTime,
        doctorName,
        patientName,
    }
}

// ─── Cancel Appointment ───────────────────────────────────────────────────────
/**
 * Cancel a previously booked appointment by event ID
 * @param {string} eventId
 */
export async function cancelAppointment(eventId) {
    if (!eventId)             throw new BookingError('Event ID required')
    if (!isAuthenticated())   throw new CalendarAuthError('Not authenticated')

    const auth     = getOAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })

    try {
        await calendar.events.delete({
            calendarId: config.doctorCalendarId,
            eventId,
            sendNotifications: true,
        })
        console.log(`[Calendar] Appointment cancelled: ${eventId}`)
        return { cancelled: true, eventId }
    } catch (err) {
        if (err.code === 410) throw new BookingError('Appointment already cancelled')
        throw new BookingError('Failed to cancel appointment: ' + err.message)
    }
}