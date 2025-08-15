const { Router } = require('express');
const router = Router();
const store = require('../data/store');

function genId(prefix = 'ord_') {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}

// GET /orders -> list all
router.get('/', (req, res) => {
  res.json({ ok: true, count: store.orders.length, orders: store.orders });
});

// POST /orders -> create new order
// body: { items: [{ sku, qty, price }], currency: "USD|GBP|EUR" }
router.post('/', (req, res) => {
  const { items, currency } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: 'items array is required' });
  }
  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ ok: false, error: 'currency is required' });
  }

  const amount = items.reduce((sum, it) => {
    const qty = Number(it?.qty || 0);
    const price = Number(it?.price || 0);
    if (qty <= 0 || price < 0) return sum;
    return sum + qty * price;
  }, 0);

  const order = {
    id: genId(),
    status: 'PENDING',
    currency,
    amount,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.orders.push(order);
  res.status(201).json({ ok: true, order });
});

module.exports = router;
