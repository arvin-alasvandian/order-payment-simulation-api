const { Router } = require('express');
const router = Router();
const Order = require('../models/Order');

function calcAmount(items = []) {
  return items.reduce((sum, it) => {
    const qty = Number(it?.qty || 0);
    const price = Number(it?.price || 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price < 0) return sum;
    return sum + qty * price;
  }, 0);
}

// GET /orders -> list latest first
router.get('/', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json({ ok: true, count: orders.length, orders });
});

// POST /orders -> create in DB
router.post('/', async (req, res) => {
  try {
    const { items, currency } = req.body || {};
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ ok: false, error: 'items array is required' });
    if (!currency) return res.status(400).json({ ok: false, error: 'currency is required' });

    const amount = calcAmount(items);
    const order = await Order.create({ items, currency, amount, status: 'PENDING' });
    res.status(201).json({ ok: true, order });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

module.exports = router;
