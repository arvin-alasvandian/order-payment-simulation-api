// routes/payments.js
const { Router } = require('express');
const mongoose = require('mongoose');
const router = Router();

// Models (lowercase filenames)
const Order = require('../models/order');
const Payment = require('../models/payment');

// Optional idempotency model: if not present, code still works
let IdemKey = null;
try {
  IdemKey = require('../models/idempotencyKey'); // create this model if you want idempotency
} catch (_) {
  // no-op
}

// Helpers
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /payments -> list all payments (newest first)
router.get('/', async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).lean();
  res.json({ ok: true, count: payments.length, payments });
});

// GET /payments/:id -> fetch one payment
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ ok: false, error: 'invalid id' });
  }
  const payment = await Payment.findById(id).lean();
  if (!payment) return res.status(404).json({ ok: false, error: 'payment not found' });
  res.json({ ok: true, payment });
});

// POST /payments -> simulate a payment
// body: { orderId: "<ObjectId>", method: "card|wallet|bank", outcome?: "success|fail" }
// headers (optional): Idempotency-Key: <string>
router.post('/', async (req, res) => {
  try {
    const { orderId, method, outcome } = req.body || {};
    const idemKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'] || null;

    // Basic validation (lightweight, no Joi dependency)
    if (!orderId || !isValidObjectId(orderId)) {
      return res.status(400).json({ ok: false, error: 'orderId is required and must be a valid ObjectId' });
    }
    const validMethods = new Set(['card', 'wallet', 'bank']);
    if (!method || !validMethods.has(method)) {
      return res.status(400).json({ ok: false, error: 'method must be one of card|wallet|bank' });
    }
    if (outcome && !['success', 'fail'].includes(outcome)) {
      return res.status(400).json({ ok: false, error: 'outcome, if provided, must be success|fail' });
    }

    // Idempotency: return the previously saved response if key already used
    if (idemKey && IdemKey) {
      const existing = await IdemKey.findOne({ key: idemKey }).lean();
      if (existing) {
        return res.status(201).json(existing.response);
      }
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, error: 'order not found' });

    // Decide the result (70% success if not forced)
    const didSucceed = outcome ? outcome === 'success' : Math.random() < 0.7;

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      method,
      amount: order.amount,
      currency: order.currency,
      status: didSucceed ? 'SUCCEEDED' : 'FAILED'
    });

    // Update order status
    order.status = didSucceed ? 'PAID' : 'FAILED';
    await order.save();

    const response = { ok: true, payment, order };

    // Save idempotency response if enabled
    if (idemKey && IdemKey) {
      try {
        await IdemKey.create({ key: idemKey, orderId: order._id, response });
      } catch (e) {
        // If unique key race happened, fetch and return the existing one
        const fallback = await IdemKey.findOne({ key: idemKey }).lean();
        if (fallback) return res.status(201).json(fallback.response);
        // otherwise ignore
      }
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;
