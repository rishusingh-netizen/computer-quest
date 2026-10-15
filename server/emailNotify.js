/**
 * Server-side transactional email for UPI payment submissions.
 * Provider: Resend HTTP API (no frontend exposure of secrets).
 *
 * Env:
 *   CQ_PAYMENT_NOTIFICATION_EMAIL — admin inbox (required to send)
 *   RESEND_API_KEY               — Resend API key
 *   CQ_EMAIL_FROM                — optional verified sender
 *
 * Email failure never blocks payment persistence or activates membership.
 */

function adminNotifyEmail() {
  return String(process.env.CQ_PAYMENT_NOTIFICATION_EMAIL || '').trim()
}

function resendApiKey() {
  return String(process.env.RESEND_API_KEY || '').trim()
}

function fromAddress() {
  const from = String(process.env.CQ_EMAIL_FROM || '').trim()
  if (from) return from
  return 'Computer Quest <onboarding@resend.dev>'
}

export function getEmailNotifyStatus() {
  const to = adminNotifyEmail()
  const key = resendApiKey()
  if (!to) return { configured: false, reason: 'CQ_PAYMENT_NOTIFICATION_EMAIL not set' }
  if (!key) return { configured: false, reason: 'RESEND_API_KEY not set' }
  return { configured: true }
}

export async function sendPaymentSubmissionEmail(order) {
  const status = getEmailNotifyStatus()
  if (!status.configured) {
    console.warn('[cq-email] skip payment notification:', status.reason)
    return { ok: false, skipped: true, error: status.reason }
  }
  if (!order?.id) return { ok: false, error: 'order required' }

  const to = adminNotifyEmail()
  const subject = 'New Computer Quest UPI Payment Submission'
  const amount =
    order.amount_inr != null
      ? `₹${order.amount_inr}`
      : `₹${Math.round((order.amount_paise || 0) / 100)}`
  const submittedAt = order.submitted_at || order.updated_at || new Date().toISOString()

  const text = [
    'New Computer Quest UPI Payment Submission',
    '',
    'A student submitted UPI payment details for verification.',
    'This is NOT a verified payment. Do not treat this email as confirmation of funds.',
    '',
    `Student name: ${order.user_name || '—'}`,
    `Student email: ${order.user_email || '—'}`,
    `Course plan: ${order.plan_name || order.plan_id || '—'}`,
    `Amount: ${amount}`,
    `Order reference: ${order.id}`,
    `UTR / UPI transaction ID: ${order.utr || '—'}`,
    `Submission date/time: ${submittedAt}`,
    `Current payment status: SUBMITTED`,
    '',
    'Please verify the UTR/payment in your bank/UPI account and then verify the payment from the Computer Quest Admin panel (Admin → Payments).',
    'Do not use any unverified link to grant access. Verification must be done inside the protected Admin panel.',
    '',
    '— Computer Quest',
  ].join('\n')

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">New Computer Quest UPI Payment Submission</h2>
      <p>A student submitted UPI payment details for verification.</p>
      <p style="background:#fef3c7;padding:10px;border-radius:6px">
        <strong>This is NOT a verified payment.</strong> Do not treat this email as confirmation of funds.
      </p>
      <table style="border-collapse:collapse;margin:12px 0">
        <tr><td style="padding:4px 12px 4px 0"><strong>Student name</strong></td><td>${escapeHtml(order.user_name || '—')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Student email</strong></td><td>${escapeHtml(order.user_email || '—')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Course plan</strong></td><td>${escapeHtml(order.plan_name || order.plan_id || '—')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Amount</strong></td><td>${escapeHtml(amount)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Order reference</strong></td><td><code>${escapeHtml(order.id)}</code></td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>UTR / UPI transaction ID</strong></td><td><code>${escapeHtml(order.utr || '—')}</code></td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Submission date/time</strong></td><td>${escapeHtml(submittedAt)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Current payment status</strong></td><td>SUBMITTED</td></tr>
      </table>
      <p>Please verify the UTR/payment in your bank/UPI account and then verify the payment from the <strong>Computer Quest Admin panel</strong> (Admin → Payments).</p>
      <p style="color:#64748b;font-size:13px">Verification must be completed inside the protected Admin panel. This email does not grant course access.</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [to],
        subject,
        text,
        html,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.warn('[cq-email] Resend error', res.status, errText.slice(0, 300))
      return { ok: false, error: `Resend ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    console.warn('[cq-email] send failed', e.message || e)
    return { ok: false, error: e.message || 'send failed' }
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
