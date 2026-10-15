/**
 * Course metadata defaults (name, modules, includes).
 * Active price is owned by the server (course_config) and edited in Admin → Courses.
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
  price: null,
  priceLabel: null,
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

/** Payment: direct UPI ID/QR — membership only after admin verifies UTR. */
export const PAYMENT_CONFIG = {
  mode: 'direct_upi',
  provider: 'direct_upi',
  currency: 'INR',
  methods: ['upi'],
  note:
    'Pay directly via UPI (UPI ID / QR). Amount comes from the server plan price. Membership activates only after admin verifies your UTR.',
}

export function formatPrice(amount, currency = 'INR') {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(Number(amount))) {
    return '—'
  }
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
