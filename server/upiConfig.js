/**
 * Owner UPI details for direct UPI payments (no payment gateway).
 * Priority: environment variables → server/data/upi-config.json → placeholders.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = path.join(__dirname, 'data', 'upi-config.json')

const PLACEHOLDER = {
  upiId: '[MY_UPI_ID]',
  displayName: '[MY_DISPLAY_NAME]',
  qrImageUrl: '[MY_UPI_QR_IMAGE]',
}

function readFileConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {}
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {}
  } catch {
    return {}
  }
}

export function getUpiConfig() {
  const file = readFileConfig()
  const upiId = String(process.env.CQ_UPI_ID || file.upiId || PLACEHOLDER.upiId).trim()
  const displayName = String(
    process.env.CQ_UPI_DISPLAY_NAME || file.displayName || PLACEHOLDER.displayName
  ).trim()
  let qrImageUrl = String(
    process.env.CQ_UPI_QR_IMAGE || file.qrImageUrl || PLACEHOLDER.qrImageUrl
  ).trim()
  if (qrImageUrl === PLACEHOLDER.qrImageUrl || qrImageUrl === '[MY_UPI_QR_IMAGE]') {
    qrImageUrl = ''
  }
  const configured = Boolean(upiId && upiId !== PLACEHOLDER.upiId && !upiId.includes('MY_UPI'))
  return { upiId, displayName, qrImageUrl, configured }
}

export function buildUpiDeepLink({ upiId, displayName, amountInr, orderRef }) {
  const pa = encodeURIComponent(String(upiId || '').trim())
  const pn = encodeURIComponent(String(displayName || 'Computer Quest').trim())
  const am = encodeURIComponent(String(Number(amountInr).toFixed(2)))
  const tn = encodeURIComponent(String(orderRef || 'Computer Quest').slice(0, 50))
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`
}

export function resolveQrImageUrl(upiConfig, deepLink) {
  if (upiConfig.qrImageUrl) return upiConfig.qrImageUrl
  if (!deepLink) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deepLink)}`
}
