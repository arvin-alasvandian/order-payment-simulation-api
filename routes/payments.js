// routes/payments.js
const { Router } = require('express');
const router = Router();
const store = require('../data/store');

function genId(prefix = 'pay_') {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}

router.get('/', (req, res) => {
  res.json({ ok: true, count: store.payments.length, payments: store.payments });
});

router.post('/', (req, res) => {
  const { orderId, method, outcome } = req.body || {};
  if (!orderId) return res.status(400).json({ ok: false, error: 'orderId is required' });
  if (!method) return res.status(400).json({ ok: false, error: 'method is required' });

  const order = store.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ ok: false, error: 'order not found' });

  const didSucceed = outcome ? outcome === 'success' : Math.random() < 0.7;

  order.status = didSucceed ? 'PAID' : 'FAILED';
  order.updatedAt = new Date().toISOString();

  const payment = {
    id: genId(),
    orderId: order.id,
    method,
    amount: order.amount,
    currency: order.currency,
    status: didSucceed ? 'SUCCEEDED' : 'FAILED',
    createdAt: new Date().toISOString()
  };

  store.payments.push(payment);
  res.status(201).json({ ok: true, payment, order });
});

module.exports = router;
