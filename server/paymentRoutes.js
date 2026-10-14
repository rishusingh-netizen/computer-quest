import express from 'express'
import { db } from './db.js'
import {
  authMiddleware,
  signToken,
  publicUser,
  getMembership,
  membershipPublic,
  hydrateMembershipFromDurable,
  persistMembership,
} from './auth.js'
import { findPlan } from './courseConfigStore.js'
import {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyCheckoutSignature,
  fetchRazorpayPayment,
  verifyWebhookSignature,
  isPaidPaymentStatus,
} from './razorpay.js'

export function createPaymentRouter({ getConfig, uid }) {
  const router = express.Router()

  async function activateMembershipForOrder(order, user) {
    const cfg = await getConfig()
    const plan = order.plan_id ? findPlan(cfg, order.plan_id) : null
    const rawDays = plan
      ? Number(plan.duration_days ?? plan.durationDays)
      : Number(cfg.duration_days)
    const durationDays =
      Number.isFinite(rawDays) && rawDays > 0
        ? Math.round(rawDays)
        : Number(cfg.duration_days) > 0
          ? Math.round(Number(cfg.duration_days))
          : 730
    const planId = plan?.id || order.plan_id || null
    const source = planId ? `purchase:${planId}` : 'purchase'
    const start = new Date()
    const end = new Date(start)
    end.setDate(end.getDate() + durationDays)
    const u = user || db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id)
    const persisted = await persistMembership(u, {
      status: 'active',
      start_at: start.toISOString(),
      expires_at: end.toISOString(),
      source,
      plan_id: planId,
    })
    return { user: u, mem: persisted.row || getMembership(u.id), persisted, durationDays, planId }
  }

  async function fulfillPaidOrderFromPayment(payment) {
    const notes = payment?.notes || {}
    const localOrderId = notes.local_order_id || notes.localOrderId
    if (!localOrderId) return { status: 'order_not_found' }
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(localOrderId)
    if (!order) return { status: 'order_not_found' }
    if (order.status === 'paid') return { status: 'already_paid', orderId: order.id }
    const amountOk = Number(payment.amount) === Number(order.amount_paise)
    const currencyOk = String(payment.currency || 'INR').toUpperCase() === 'INR'
    if (!amountOk || !currencyOk || !isPaidPaymentStatus(payment.status)) {
      return {
        status: 'rejected',
        reason: !amountOk ? 'amount_mismatch' : !currencyOk ? 'currency_mismatch' : 'status',
      }
    }
    const now = new Date().toISOString()
    const ref = `${payment.order_id || ''}:${payment.id || ''}`
    db.prepare(`UPDATE orders SET status = 'paid', provider_ref = ?, updated_at = ? WHERE id = ?`).run(
      ref,
      now,
      order.id
    )
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id)
    if (!user) return { status: 'user_not_found', orderId: order.id }
    await activateMembershipForOrder(order, user)
    return { status: 'paid', orderId: order.id }
  }

  router.post(
    '/razorpay-webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const signature = req.headers['x-razorpay-signature']
        const raw =
          Buffer.isBuffer(req.body)
            ? req.body.toString('utf8')
            : typeof req.body === 'string'
              ? req.body
              : ''
        if (!verifyWebhookSignature(raw, signature)) {
          return res.status(400).json({ ok: false, error: 'Invalid webhook signature' })
        }
        let event
        try {
          event = JSON.parse(raw || '{}')
        } catch {
          return res.status(400).json({ ok: false, error: 'Invalid JSON' })
        }
        const eventName = event?.event || ''
        const payment = event?.payload?.payment?.entity
        if (!payment) return res.json({ ok: true, ignored: true })
        if (eventName === 'payment.failed') {
          const localId = payment.notes?.local_order_id
          if (localId) {
            const now = new Date().toISOString()
            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(localId)
            if (order && order.status === 'created') {
              db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`).run(now, localId)
            }
          }
          return res.json({ ok: true, status: 'failed' })
        }
        if (eventName !== 'payment.captured' && eventName !== 'payment.authorized') {
          return res.json({ ok: true, ignored: true, event: eventName })
        }
        const result = await fulfillPaidOrderFromPayment(payment)
        return res.json({ ok: true, ...result })
      } catch (e) {
        console.error('[razorpay-webhook]', e)
        return res.status(500).json({ ok: false, error: 'Webhook handler failed' })
      }
    }
  )

  router.post('/create-order', authMiddleware, async (req, res) => {
    try {
      const { configured, keyId } = getRazorpayConfig()
      if (!configured) {
        return res.status(503).json({
          ok: false,
          error:
            'UPI payments are not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.',
          code: 'RAZORPAY_NOT_CONFIGURED',
        })
      }
      const cfg = await getConfig()
      const planId = String(req.body?.planId || req.body?.plan_id || '').trim()
      let plan = planId ? findPlan(cfg, planId) : null
      if (planId && (!plan || !plan.active)) {
        return res.status(400).json({ ok: false, error: 'Selected plan is not available' })
      }
      if (!plan) plan = (cfg.plans || []).find((p) => p.active) || null
      const amountPaise = plan ? Number(plan.price_paise) || 0 : Number(cfg.price_paise) || 0
      if (!amountPaise || amountPaise < 100) {
        return res.status(400).json({ ok: false, error: 'Invalid plan price' })
      }
      const durationDays = plan ? Number(plan.duration_days) || 730 : Number(cfg.duration_days) || 730
      const resolvedPlanId = plan?.id || null
      const id = uid('ord')
      const now = new Date().toISOString()
      const rzpOrder = await createRazorpayOrder({
        amountPaise,
        receipt: id,
        notes: {
          local_order_id: id,
          user_id: req.user.id,
          plan_id: resolvedPlanId || '',
        },
      })
      db.prepare(
        `INSERT INTO orders (id, user_id, amount_paise, currency, status, provider, created_at, updated_at, plan_id)\n         VALUES (?, ?, ?, 'INR', 'created', 'razorpay', ?, ?, ?)`
      ).run(id, req.user.id, amountPaise, now, now, resolvedPlanId)
      db.prepare(`UPDATE orders SET provider_ref = ?, updated_at = ? WHERE id = ?`).run(rzpOrder.id, now, id)
      res.json({
        ok: true,
        order: {
          id,
          amountPaise,
          amountInr: Math.round(amountPaise / 100),
          currency: 'INR',
          status: 'created',
          provider: 'razorpay',
          planId: resolvedPlanId,
          planName: plan?.name || cfg.title,
          durationDays,
          razorpayOrderId: rzpOrder.id,
          keyId,
        },
      })
    } catch (e) {
      console.error(e)
      const status = e.code === 'RAZORPAY_NOT_CONFIGURED' ? 503 : 500
      res.status(status).json({ ok: false, error: e.message || 'Failed to create order', code: e.code })
    }
  })

  router.post('/confirm', authMiddleware, async (req, res) => {
    try {
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        cancelled,
        failed,
      } = req.body || {}
      const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id)
      if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })
      const now = new Date().toISOString()
      if (cancelled) {
        if (order.status === 'created') {
          db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?`).run(now, orderId)
        }
        return res.json({ ok: false, status: 'cancelled', error: 'Payment cancelled' })
      }
      if (failed) {
        if (order.status === 'created') {
          db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`).run(now, orderId)
        }
        return res.json({ ok: false, status: 'failed', error: 'Payment failed' })
      }
      if (order.status === 'paid') {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) || req.user
        await hydrateMembershipFromDurable(user)
        const mem = getMembership(user.id)
        const token = signToken(user, mem)
        return res.json({
          ok: true,
          status: 'paid',
          alreadyPaid: true,
          token,
          user: publicUser(user, membershipPublic(mem)),
        })
      }
      const { configured } = getRazorpayConfig()
      if (!configured) {
        return res.status(503).json({
          ok: false,
          error: 'Payment verification is not configured on the server.',
          code: 'RAZORPAY_NOT_CONFIGURED',
        })
      }
      if (req.body?.mockResult) {
        return res.status(400).json({
          ok: false,
          error: 'Mock payments are disabled. Complete a real UPI payment.',
        })
      }
      if (!verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
        return res.status(400).json({ ok: false, error: 'Invalid payment signature' })
      }
      let payment
      try {
        payment = await fetchRazorpayPayment(razorpay_payment_id)
      } catch (e) {
        console.error('[confirm] fetch payment', e)
        return res.status(502).json({ ok: false, error: 'Could not verify payment with provider' })
      }
      if (payment.order_id && razorpay_order_id && payment.order_id !== razorpay_order_id) {
        return res.status(400).json({ ok: false, error: 'Payment order mismatch' })
      }
      if (Number(payment.amount) !== Number(order.amount_paise)) {
        return res.status(400).json({ ok: false, error: 'Payment amount mismatch' })
      }
      if (String(payment.currency || '').toUpperCase() !== 'INR') {
        return res.status(400).json({ ok: false, error: 'Invalid currency' })
      }
      if (!isPaidPaymentStatus(payment.status)) {
        return res.status(400).json({
          ok: false,
          status: payment.status || 'unknown',
          error: 'Payment is not completed',
        })
      }
      const ref = `${razorpay_order_id}:${razorpay_payment_id}`
      db.prepare(`UPDATE orders SET status = 'paid', provider_ref = ?, updated_at = ? WHERE id = ?`).run(
        ref,
        now,
        orderId
      )
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) || req.user
      const { mem, persisted } = await activateMembershipForOrder(order, user)
      const token = signToken(user, mem)
      res.json({
        ok: true,
        status: 'paid',
        token,
        user: publicUser(user, membershipPublic(mem)),
        durable: persisted.durable?.durable,
        warning: persisted.durable?.warning,
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Payment confirmation failed' })
    }
  })

  return router
}
