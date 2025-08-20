const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0.01 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  items: { type: [ItemSchema], required: true, validate: v => v.length > 0 },
  currency: { type: String, required: true, enum: ['GBP', 'USD', 'EUR'] },
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, required: true, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
