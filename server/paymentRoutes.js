/**
 * Direct UPI payment routes (no payment gateway).
 * Flow: create PENDING order → student pays via UPI → submit UTR → admin VERIFY → membership.
 */
import express from 'express'
import { db } from './db.js'
import {
  authMiddleware,
  adminMiddleware,
  getMembership,
  membershipPublic,
  persistMembership,
} from './auth.js'
import { findPlan } from './courseConfigStore.js'
import { getUpiConfig, buildUpiDeepLink, resolveQrImageUrl } from './upiConfig.js'
import {
  loadPaymentsDoc,
  savePayment,
  findOrderById,
  findOrderByUtr,
  listOrders,
  listOrdersForUser,
} from './paymentStore.js'
import { sendPaymentSubmissionEmail } from './emailNotify.js'

function orderRef() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CQ-${part()}${part()}`
}

function publicOrder(o) {
  if (!o) return null
  return {
    id: o.id,
    status: o.status,
    planId: o.plan_id,
    planName: o.plan_name,
    amountPaise: o.amount_paise,
    amountInr: o.amount_inr,
    currency: 'INR',
    utr: o.utr || null,
    paidAt: o.paid_at || null,
    submittedAt: o.submitted_at || null,
    verifiedAt: o.verified_at || null,
    rejectReason: o.reject_reason || null,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }
}

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

  router.get('/upi-config', (_req, res) => {
    const upi = getUpiConfig()
    res.json({
      ok: true,
      upi: {
        upiId: upi.upiId,
        displayName: upi.displayName,
        qrImageUrl: upi.qrImageUrl || '',
        configured: upi.configured,
        method: 'direct_upi',
        note: 'Pay via UPI. Course access activates only after admin verifies your transaction ID (UTR).',
      },
    })
  })

  router.post('/create-order', authMiddleware, async (req, res) => {
    try {
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
      const amountInr = Math.round(amountPaise / 100)
      const durationDays = plan ? Number(plan.duration_days) || 730 : Number(cfg.duration_days) || 730
      const resolvedPlanId = plan?.id || null
      const id = orderRef()
      const now = new Date().toISOString()

      const upi = getUpiConfig()
      const deepLink = buildUpiDeepLink({
        upiId: upi.upiId,
        displayName: upi.displayName,
        amountInr,
        orderRef: id,
      })
      const qrImageUrl = resolveQrImageUrl(upi, deepLink)

      const order = {
        id,
        user_id: req.user.id,
        user_email: req.user.email || '',
        user_name: req.user.name || '',
        plan_id: resolvedPlanId,
        plan_name: plan?.name || cfg.title || 'Computer Quest',
        amount_paise: amountPaise,
        amount_inr: amountInr,
        duration_days: durationDays,
        status: 'PENDING',
        utr: null,
        paid_at: null,
        submitted_at: null,
        verified_at: null,
        verified_by: null,
        reject_reason: null,
        provider: 'direct_upi',
        created_at: now,
        updated_at: now,
      }

      const saved = await savePayment(order)

      try {
        db.prepare(
          `INSERT INTO orders (id, user_id, amount_paise, currency, status, provider, created_at, updated_at, plan_id)
           VALUES (?, ?, ?, 'INR', 'created', 'direct_upi', ?, ?, ?)`
        ).run(id, req.user.id, amountPaise, now, now, resolvedPlanId)
      } catch {
        /* ignore */
      }

      res.json({
        ok: true,
        order: publicOrder(saved.order || order),
        upi: {
          upiId: upi.upiId,
          displayName: upi.displayName,
          qrImageUrl,
          deepLink,
          amountInr,
          currency: 'INR',
        },
        durable: saved.durable,
        warning: saved.warning,
        message:
          'Pay the exact amount via UPI, then submit your UTR/transaction ID. Access activates only after admin verification.',
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: e.message || 'Failed to create order' })
    }
  })

  router.post('/submit', authMiddleware, async (req, res) => {
    try {
      const orderId = String(req.body?.orderId || '').trim()
      const utr = String(req.body?.utr || req.body?.transactionId || '').trim()
      const paidAt = req.body?.paidAt ? String(req.body.paidAt) : null
      const note = req.body?.note ? String(req.body.note).slice(0, 500) : null

      if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' })
      if (!utr || utr.length < 6) {
        return res.status(400).json({ ok: false, error: 'Valid UPI transaction ID / UTR required' })
      }

      const doc = await loadPaymentsDoc({ force: true })
      const order = findOrderById(doc, orderId)
      if (!order || order.user_id !== req.user.id) {
        return res.status(404).json({ ok: false, error: 'Order not found' })
      }
      if (order.status === 'VERIFIED') {
        return res.json({ ok: true, order: publicOrder(order), message: 'This payment was already verified.' })
      }
      if (order.status === 'CANCELLED') {
        return res.status(400).json({ ok: false, error: 'This order was cancelled. Create a new order.' })
      }

      const existingUtr = findOrderByUtr(doc, utr)
      if (existingUtr && existingUtr.id !== orderId) {
        return res.status(409).json({
          ok: false,
          error: 'This transaction ID was already submitted for another order.',
        })
      }

      const now = new Date().toISOString()
      const updated = {
        ...order,
        status: 'SUBMITTED',
        utr: utr.toUpperCase(),
        paid_at: paidAt || now,
        submitted_at: now,
        note,
        reject_reason: null,
        updated_at: now,
      }

      const alreadyNotified = Boolean(order.notification_sent_at)
      const wasAlreadySubmitted = order.status === 'SUBMITTED' && order.utr === updated.utr

      const saved = await savePayment(updated)

      try {
        db.prepare(`UPDATE orders SET status = 'submitted', provider_ref = ?, updated_at = ? WHERE id = ?`).run(
          updated.utr,
          now,
          orderId
        )
      } catch {
        /* ignore */
      }

      if (!alreadyNotified && !wasAlreadySubmitted) {
        try {
          const mail = await sendPaymentSubmissionEmail(saved.order || updated)
          if (mail.ok) {
            try {
              await savePayment({
                ...(saved.order || updated),
                notification_sent_at: new Date().toISOString(),
              })
            } catch {
              /* ignore stamp failure */
            }
          }
        } catch (e) {
          console.warn('[cq-payments] email notify', e.message || e)
        }
      }

      res.json({
        ok: true,
        order: publicOrder(saved.order || updated),
        message:
          'Payment details submitted successfully. We will verify your payment and activate your course access after confirmation.',
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to submit payment details' })
    }
  })

  router.get('/mine', authMiddleware, async (req, res) => {
    try {
      const doc = await loadPaymentsDoc()
      res.json({ ok: true, orders: listOrdersForUser(doc, req.user.id).map(publicOrder) })
    } catch (e) {
      res.status(500).json({ ok: false, error: 'Failed to load payments' })
    }
  })

  router.post('/cancel', authMiddleware, async (req, res) => {
    try {
      const orderId = String(req.body?.orderId || '').trim()
      const doc = await loadPaymentsDoc({ force: true })
      const order = findOrderById(doc, orderId)
      if (!order || order.user_id !== req.user.id) {
        return res.status(404).json({ ok: false, error: 'Order not found' })
      }
      if (order.status === 'VERIFIED') {
        return res.status(400).json({ ok: false, error: 'Verified orders cannot be cancelled' })
      }
      if (order.status === 'SUBMITTED') {
        return res.status(400).json({
          ok: false,
          error: 'Payment already submitted for verification. Contact support if needed.',
        })
      }
      const now = new Date().toISOString()
      const updated = { ...order, status: 'CANCELLED', updated_at: now }
      const saved = await savePayment(updated)
      res.json({ ok: true, order: publicOrder(saved.order || updated) })
    } catch (e) {
      res.status(500).json({ ok: false, error: 'Failed to cancel order' })
    }
  })

  router.post('/confirm', authMiddleware, async (req, res) => {
    if (req.body?.mockResult || req.body?.status === 'VERIFIED' || req.body?.status === 'paid') {
      return res.status(400).json({
        ok: false,
        error:
          'Automatic payment confirmation is disabled. Pay via UPI and submit your UTR for admin verification.',
      })
    }
    return res.status(400).json({
      ok: false,
      error: 'Use POST /api/payments/submit with your UTR after paying via UPI.',
    })
  })

  router.get('/admin/list', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const doc = await loadPaymentsDoc({ force: true })
      let orders = listOrders(doc)
      const status = String(req.query?.status || '').toUpperCase()
      if (status) orders = orders.filter((o) => o.status === status)
      res.json({
        ok: true,
        orders: orders.map((o) => ({
          ...publicOrder(o),
          userId: o.user_id,
          userEmail: o.user_email,
          userName: o.user_name,
          note: o.note || null,
        })),
      })
    } catch (e) {
      res.status(500).json({ ok: false, error: 'Failed to load payment submissions' })
    }
  })

  router.post('/admin/verify', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const orderId = String(req.body?.orderId || '').trim()
      if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' })

      const doc = await loadPaymentsDoc({ force: true })
      const order = findOrderById(doc, orderId)
      if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })

      if (order.status === 'VERIFIED') {
        return res.json({
          ok: true,
          alreadyVerified: true,
          order: publicOrder(order),
          message: 'Order was already verified.',
        })
      }
      if (order.status === 'CANCELLED') {
        return res.status(400).json({ ok: false, error: 'Cannot verify a cancelled order' })
      }
      if (!order.utr) {
        return res.status(400).json({ ok: false, error: 'Student has not submitted a UTR yet' })
      }

      const byUtr = findOrderByUtr(doc, order.utr)
      if (byUtr && byUtr.id !== order.id && byUtr.status === 'VERIFIED') {
        return res.status(409).json({
          ok: false,
          error: 'This UTR is already verified on another order',
        })
      }

      const now = new Date().toISOString()
      const updated = {
        ...order,
        status: 'VERIFIED',
        verified_at: now,
        verified_by: req.user.email || req.user.id,
        reject_reason: null,
        updated_at: now,
      }
      const saved = await savePayment(updated)

      const user =
        db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id) || {
          id: order.user_id,
          email: order.user_email,
          name: order.user_name,
          role: 'student',
        }
      const { mem, persisted } = await activateMembershipForOrder(updated, user)

      try {
        db.prepare(
          `UPDATE orders SET status = 'paid', provider_ref = ?, updated_at = ? WHERE id = ?`
        ).run(order.utr, now, orderId)
      } catch {
        /* ignore */
      }

      res.json({
        ok: true,
        order: publicOrder(saved.order || updated),
        membership: membershipPublic(mem),
        durable: persisted?.durable?.durable,
        message: 'Payment verified. Membership activated.',
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to verify payment' })
    }
  })

  router.post('/admin/reject', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const orderId = String(req.body?.orderId || '').trim()
      const reason = String(req.body?.reason || 'Payment could not be verified').slice(0, 300)
      if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' })

      const doc = await loadPaymentsDoc({ force: true })
      const order = findOrderById(doc, orderId)
      if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })
      if (order.status === 'VERIFIED') {
        return res.status(400).json({ ok: false, error: 'Cannot reject an already verified payment' })
      }

      const now = new Date().toISOString()
      const updated = {
        ...order,
        status: 'REJECTED',
        reject_reason: reason,
        updated_at: now,
      }
      const saved = await savePayment(updated)

      try {
        db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`).run(now, orderId)
      } catch {
        /* ignore */
      }

      res.json({
        ok: true,
        order: publicOrder(saved.order || updated),
        message: 'Payment rejected. Membership was not activated.',
      })
    } catch (e) {
      res.status(500).json({ ok: false, error: 'Failed to reject payment' })
    }
  })

  return router
}
