/**
 * Central course & pricing configuration.
 * Change price/currency/duration here only — UI reads from this module.
 */

export const COURSE = {
  id: 'computer-quest-main',
  batchId: 'batch-2026-standard',
  name: 'Computer Quest',
  tagline: 'Learn computer skills from beginner to advanced — the fun way.',
  description:
    'A complete interactive course for school, college and beginner students: lessons, practice labs, skill games, tests, smart revision and Quest Helper.',
  durationYears: 2,
  currency: 'INR',
  /** Price in smallest currency unit display value (rupees) */
  price: 2999,
  priceLabel: '₹2,999',
  includes: [
    'Levels 1–9 full interactive lessons',
    'Practice Lab simulations (including Word, Excel, PowerPoint)',
    'Game Zone skill games',
    'Level tests with review',
    'Smart Revision system',
    'Quest Helper study companion',
    'XP, streak and progress tracking',
    'Server-issued Certificate of Course Completion',
    '2 years of access from enrollment date',
  ],
  modules: [
    { name: 'Learn', detail: 'Structured lessons with quizzes' },
    { name: 'Practice Lab', detail: 'Hands-on browser simulations' },
    { name: 'Game Zone', detail: 'Typing, shortcuts, security games' },
    { name: 'Tests', detail: 'Timed level tests + review' },
    { name: 'Revision', detail: 'Weak-topic focused refresh' },
    { name: 'Quest Helper', detail: 'Context-aware study help' },
  ],
}

/** Payment mode: 'mock' until real provider credentials are configured server-side */
export const PAYMENT_CONFIG = {
  mode: 'mock', // 'mock' | 'live' (live requires backend)
  provider: 'mock-gateway',
  currency: COURSE.currency,
  amount: COURSE.price,
  note:
    'Development uses MOCK payment only. Real Razorpay/Stripe keys must stay on a server — never in this frontend.',
}

export function formatPrice(amount = COURSE.price, currency = COURSE.currency) {
  if (currency === 'INR') return `₹${Number(amount).toLocaleString('en-IN')}`
  return `${currency} ${amount}`
}

export function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

export function daysRemaining(expiryIso) {
  if (!expiryIso) return 0
  const end = new Date(expiryIso).getTime()
  const now = Date.now()
  if (end <= now) return 0
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}
