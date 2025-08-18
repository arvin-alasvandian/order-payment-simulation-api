// routes/payments.js
const { Router } = require('express');
const router = Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// GET /payments -> list latest first
router.get('/', async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).lean();
  res.json({ ok: true, count: payments.length, payments });
});


// POST /payments
// body: { orderId: "<ObjectId>", method: "card|wallet|bank", outcome?: "success|fail" }
router.post('/', async (req, res) => {
  try {
    const { orderId, method, outcome } = req.body || {};
    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId is required' });
    if (!method) return res.status(400).json({ ok: false, error: 'method is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, error: 'order not found' });

    // decide success/failure (70% success if not forced)
    const didSucceed = outcome ? outcome === 'success' : Math.random() < 0.7;

    // create payment record
    const payment = await Payment.create({
      orderId: order._id,
      method,
      amount: order.amount,
      currency: order.currency,
      status: didSucceed ? 'SUCCEEDED' : 'FAILED'
    });

    // update order status to reflect payment result
    order.status = didSucceed ? 'PAID' : 'FAILED';
    await order.save();

    res.status(201).json({ ok: true, payment, order });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;
