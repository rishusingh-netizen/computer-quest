/**
 * Razorpay helpers for Computer Quest (UPI + Cards etc via Checkout).
 * Secrets stay server-side only (RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET).
 */
import crypto from 'crypto'

export function getRazorpayConfig() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim()
  const webhookSecret = String(process.env.RAZORPAY_WEBHOOK_SECRET || '').trim()
  const configured = Boolean(keyId && keySecret)
  return { keyId, keySecret, webhookSecret, configured }
}

function basicAuthHeader(keyId, keySecret) {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  return `Basic ${token}`
}

export async function createRazorpayOrder({ amountPaise, receipt, notes = {} }) {
  const { keyId, keySecret, configured } = getRazorpayConfig()
  if (!configured) {
    const err = new Error('Razorpay is not configured')
    err.code = 'RAZORPAY_NOT_CONFIGURED'
    throw err
  }
  const body = {
    amount: Math.round(Number(amountPaise)),
    currency: 'INR',
    receipt: String(receipt).slice(0, 40),
    notes,
    payment_capture: 1,
  }
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(keyId, keySecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.error?.description || data?.error?.reason || 'Razorpay order failed')
    err.code = 'RAZORPAY_ORDER_FAILED'
    err.status = res.status
    err.details = data
    throw err
  }
  return data
}

export function verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { keySecret, configured } = getRazorpayConfig()
  if (!configured) return false
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(razorpay_signature)))
  } catch {
    return expected === String(razorpay_signature)
  }
}

export async function fetchRazorpayPayment(paymentId) {
  const { keyId, keySecret, configured } = getRazorpayConfig()
  if (!configured) throw new Error('Razorpay is not configured')
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: basicAuthHeader(keyId, keySecret) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.error?.description || 'Failed to fetch payment')
    err.status = res.status
    err.details = data
    throw err
  }
  return data
}

export function verifyWebhookSignature(rawBody, signatureHeader) {
  const { webhookSecret } = getRazorpayConfig()
  if (!webhookSecret || !signatureHeader || rawBody == null) return false
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signatureHeader)))
  } catch {
    return expected === String(signatureHeader)
  }
}

export function isPaidPaymentStatus(status) {
  return status === 'captured' || status === 'authorized'
}
