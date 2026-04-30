// backend/src/routes/appointments.js
// Ye file banao aur server.js mein import karo

import express  from 'express'
import crypto   from 'crypto'
import { sendDoctorBookingRequest, sendPatientConfirmation, sendPatientRejection } from '../src/services/email.js'

const router = express.Router()

// In-memory store — production mein MongoDB use karo
const pendingBookings = new Map()

// ─── POST /api/appointments/request ──────────────────────────────
// Patient ne date select kiya — Dr. ko email bhejo
router.post('/request', async (req, res) => {
    const {
        doctorName, doctorEmail, doctorPhone, doctorSpecialization,
        patientName, patientEmail, symptoms, date
    } = req.body

    if (!doctorEmail || !patientName || !date) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Unique token banao
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Booking store karo
    pendingBookings.set(token, {
        doctorName, doctorEmail, doctorPhone, doctorSpecialization,
        patientName, patientEmail, symptoms, date,
        expiresAt, status: 'pending'
    })

    // Dr. ko email bhejo
    await sendDoctorBookingRequest({
        doctorName, doctorEmail,
        patientName, patientEmail,
        symptoms, date, token
    })

    res.json({ success: true, message: 'Booking request sent to doctor' })
})

// ─── GET /api/appointments/accept/:token ─────────────────────────
// Dr. ne Accept kiya
router.get('/accept/:token', async (req, res) => {
    const booking = pendingBookings.get(req.params.token)

    if (!booking) {
        return res.send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:60px">
                <h2>❌ Link expired or invalid</h2>
                <p>This booking link has expired.</p>
            </body></html>
        `)
    }

    if (Date.now() > booking.expiresAt) {
        pendingBookings.delete(req.params.token)
        return res.send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:60px">
                <h2>⏰ Link Expired</h2>
                <p>This booking link has expired (24 hours limit).</p>
            </body></html>
        `)
    }

    booking.status = 'accepted'

    // Patient ko confirmation email bhejo
    await sendPatientConfirmation({
        patientName:          booking.patientName,
        patientEmail:         booking.patientEmail,
        doctorName:           booking.doctorName,
        doctorPhone:          booking.doctorPhone,
        doctorSpecialization: booking.doctorSpecialization,
        date:                 booking.date,
        symptoms:             booking.symptoms,
    })

    pendingBookings.delete(req.params.token)

    res.send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f0fdf4">
            <div style="max-width:400px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
                <div style="font-size:48px;margin-bottom:16px">✅</div>
                <h2 style="color:#10B981">Appointment Accepted!</h2>
                <p style="color:#374151">You have accepted the appointment with <strong>${booking.patientName}</strong> on <strong>${booking.date}</strong>.</p>
                <p style="color:#6B7280;font-size:13px">The patient has been notified via email.</p>
            </div>
        </body></html>
    `)
})

// ─── GET /api/appointments/reject/:token ─────────────────────────
// Dr. ne Reject kiya
router.get('/reject/:token', async (req, res) => {
    const booking = pendingBookings.get(req.params.token)

    if (!booking) {
        return res.send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:60px">
                <h2>❌ Link expired or invalid</h2>
            </body></html>
        `)
    }

    booking.status = 'rejected'

    // Patient ko rejection email bhejo
    await sendPatientRejection({
        patientName:  booking.patientName,
        patientEmail: booking.patientEmail,
        doctorName:   booking.doctorName,
        date:         booking.date,
    })

    pendingBookings.delete(req.params.token)

    res.send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#fff7ed">
            <div style="max-width:400px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
                <div style="font-size:48px;margin-bottom:16px">❌</div>
                <h2 style="color:#EF4444">Appointment Rejected</h2>
                <p style="color:#374151">You have rejected the appointment request from <strong>${booking.patientName}</strong> for <strong>${booking.date}</strong>.</p>
                <p style="color:#6B7280;font-size:13px">The patient has been notified to choose another date.</p>
            </div>
        </body></html>
    `)
})

export default router
