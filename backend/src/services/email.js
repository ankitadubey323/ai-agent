// backend/src/services/email.js
import { Resend } from 'resend'

const resend  = new Resend(process.env.RESEND_API_KEY)
const FROM    = 'HealthAI <onboarding@resend.dev>'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// ─── 1. Dr. ko Accept/Reject email ───────────────────────────────
export async function sendDoctorBookingRequest({
    doctorName, doctorEmail,
    patientName, patientEmail,
    symptoms, date, token
}) {
    if (!doctorEmail) return console.warn('[Email] Doctor email missing')

    const acceptUrl = `${BASE_URL}/api/appointments/accept/${token}`
    const rejectUrl = `${BASE_URL}/api/appointments/reject/${token}`

    try {
        await resend.emails.send({
            from:    FROM,
            to:      doctorEmail,
            subject: `Appointment Request — ${patientName} | ${date}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
                    <div style="background:#4F46E5;padding:24px 28px">
                        <h2 style="color:#fff;margin:0;font-size:20px">📅 New Appointment Request</h2>
                        <p style="color:#C7D2FE;margin:6px 0 0;font-size:13px">HealthAI Platform</p>
                    </div>
                    <div style="padding:28px">
                        <p style="font-size:15px;color:#111827">Dear Dr. <strong>${doctorName}</strong>,</p>
                        <p style="font-size:14px;color:#374151">You have a new appointment request.</p>
                        <table style="width:100%;border-collapse:collapse;margin-top:20px">
                            <tr style="background:#F9FAFB">
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Patient Name</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #E5E7EB">${patientName}</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Patient Email</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #E5E7EB">${patientEmail || 'Not provided'}</td>
                            </tr>
                            <tr style="background:#F9FAFB">
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Requested Date</td>
                                <td style="padding:12px 16px;font-size:14px;color:#4F46E5;font-weight:700;border-bottom:1px solid #E5E7EB">${date}</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600">Symptoms</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827">${symptoms || 'Not specified'}</td>
                            </tr>
                        </table>

                        <p style="margin-top:24px;font-size:14px;color:#374151;font-weight:600">Are you available on this date?</p>

                        <div style="display:flex;gap:12px;margin-top:16px">
                            <a href="${acceptUrl}" style="flex:1;display:inline-block;padding:14px 24px;background:#10B981;color:#fff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;text-align:center">
                                ✅ Accept
                            </a>
                            <a href="${rejectUrl}" style="flex:1;display:inline-block;padding:14px 24px;background:#EF4444;color:#fff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;text-align:center">
                                ❌ Reject
                            </a>
                        </div>

                        <p style="margin-top:20px;font-size:12px;color:#9CA3AF">
                            This link will expire in 24 hours.
                        </p>
                    </div>
                    <div style="background:#F9FAFB;padding:16px 28px;border-top:1px solid #E5E7EB">
                        <p style="font-size:12px;color:#9CA3AF;margin:0">HealthAI — Smart Healthcare Platform</p>
                    </div>
                </div>
            `
        })
        console.log(`[Email] ✅ Booking request sent to Dr. ${doctorEmail}`)
    } catch (err) {
        console.error('[Email] ❌ Doctor request email failed:', err.message)
    }
}

// ─── 2. Patient ko confirmation email ────────────────────────────
export async function sendPatientConfirmation({
    patientName, patientEmail,
    doctorName, doctorPhone, doctorSpecialization,
    date, symptoms
}) {
    if (!patientEmail) return console.warn('[Email] Patient email missing')

    try {
        await resend.emails.send({
            from:    FROM,
            to:      patientEmail,
            subject: `✅ Appointment Confirmed — Dr. ${doctorName}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
                    <div style="background:#10B981;padding:24px 28px">
                        <h2 style="color:#fff;margin:0;font-size:20px">✅ Appointment Confirmed!</h2>
                        <p style="color:#D1FAE5;margin:6px 0 0;font-size:13px">HealthAI Platform</p>
                    </div>
                    <div style="padding:28px">
                        <p style="font-size:15px;color:#111827">Dear <strong>${patientName}</strong>,</p>
                        <p style="font-size:14px;color:#374151">Your appointment has been confirmed by the doctor.</p>
                        <table style="width:100%;border-collapse:collapse;margin-top:20px">
                            <tr style="background:#F9FAFB">
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Doctor</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #E5E7EB">Dr. ${doctorName}</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Specialization</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #E5E7EB">${doctorSpecialization || ''}</td>
                            </tr>
                            <tr style="background:#F9FAFB">
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Date</td>
                                <td style="padding:12px 16px;font-size:14px;color:#10B981;font-weight:700;border-bottom:1px solid #E5E7EB">${date}</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Doctor Phone</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #E5E7EB">
                                    <a href="tel:${doctorPhone}" style="color:#4F46E5">${doctorPhone || 'Not provided'}</a>
                                </td>
                            </tr>
                            <tr style="background:#F9FAFB">
                                <td style="padding:12px 16px;font-size:13px;color:#6B7280;font-weight:600">Symptoms</td>
                                <td style="padding:12px 16px;font-size:14px;color:#111827">${symptoms || 'Not specified'}</td>
                            </tr>
                        </table>
                        <p style="margin-top:24px;font-size:13px;color:#6B7280">
                            Please arrive 10 minutes early. You can call the doctor directly using the number above.
                        </p>
                    </div>
                    <div style="background:#F9FAFB;padding:16px 28px;border-top:1px solid #E5E7EB">
                        <p style="font-size:12px;color:#9CA3AF;margin:0">HealthAI — Smart Healthcare Platform</p>
                    </div>
                </div>
            `
        })
        console.log(`[Email] ✅ Confirmation sent to patient ${patientEmail}`)
    } catch (err) {
        console.error('[Email] ❌ Patient confirmation failed:', err.message)
    }
}

// ─── 3. Patient ko rejection email ───────────────────────────────
export async function sendPatientRejection({
    patientName, patientEmail, doctorName, date
}) {
    if (!patientEmail) return console.warn('[Email] Patient email missing')

    try {
        await resend.emails.send({
            from:    FROM,
            to:      patientEmail,
            subject: `Appointment Update — Dr. ${doctorName}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
                    <div style="background:#F59E0B;padding:24px 28px">
                        <h2 style="color:#fff;margin:0;font-size:20px">📅 Appointment Rescheduling Needed</h2>
                        <p style="color:#FEF3C7;margin:6px 0 0;font-size:13px">HealthAI Platform</p>
                    </div>
                    <div style="padding:28px">
                        <p style="font-size:15px;color:#111827">Dear <strong>${patientName}</strong>,</p>
                        <p style="font-size:14px;color:#374151">
                            Unfortunately, Dr. <strong>${doctorName}</strong> is not available on <strong>${date}</strong>.
                        </p>
                        <p style="font-size:14px;color:#374151;margin-top:16px">
                            Please go back to the AI agent and select a different date. The doctor will confirm the new appointment.
                        </p>
                        <div style="margin-top:24px;padding:16px;background:#FEF3C7;border-radius:8px;border-left:4px solid #F59E0B">
                            <p style="font-size:13px;color:#92400E;margin:0">
                                💡 Tip: Ask the AI agent "suggest another date" and it will help you reschedule.
                            </p>
                        </div>
                    </div>
                    <div style="background:#F9FAFB;padding:16px 28px;border-top:1px solid #E5E7EB">
                        <p style="font-size:12px;color:#9CA3AF;margin:0">HealthAI — Smart Healthcare Platform</p>
                    </div>
                </div>
            `
        })
        console.log(`[Email] Rejection email sent to patient ${patientEmail}`)
    } catch (err) {
        console.error('[Email] Patient rejection email failed:', err.message)
    }
}
