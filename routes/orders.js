const { Router } = require('express');
const router = Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const Order = require('../models/order');

// --- utility: calculate order amount ---
function calcAmount(items = []) {
  return items.reduce((sum, it) => {
    const qty = Number(it?.qty ?? 0);
    const price = Number(it?.price ?? 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) return sum;
    return sum + qty * price;
  }, 0);
}

// --- Joi schemas ---
const itemSchema = Joi.object({
  sku: Joi.string().min(1).required(),
  qty: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required()
});

const createOrderSchema = Joi.object({
  body: Joi.object({
    currency: Joi.string().valid('GBP', 'USD', 'EUR').required(),
    items: Joi.array().items(itemSchema).min(1).required()
  })
});

const idSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
});

// --- routes ---

// GET /orders → list all
router.get('/', async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json({ ok: true, count: orders.length, orders });
});

// POST /orders → create new order
router.post('/', validate(createOrderSchema), async (req, res) => {
  try {
    const { items, currency } = req.body;
    const amount = calcAmount(items);
    const order = await Order.create({ items, currency, amount, status: 'PENDING' });
    res.status(201).json({ ok: true, order });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// GET /orders/:id → get one order by id
router.get('/:id', validate(idSchema), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ ok: false, error: 'order not found' });
    res.json({ ok: true, order });
  } catch {
    res.status(400).json({ ok: false, error: 'invalid id' });
  }
});

// GET /orders/:id/payments → list all payments for this order
router.get('/:id/payments', validate(idSchema), async (req, res) => {
  const Payment = require('../models/payment');
  const payments = await Payment.find({ orderId: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, count: payments.length, payments });
});

const Payment = require('../models/payment');

router.get('/:id/payments', async (req, res) => {
  try {
    const payments = await Payment.find({ orderId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, count: payments.length, payments });
  } catch {
    res.status(400).json({ ok: false, error: 'invalid id' });
  }
});


module.exports = router;
