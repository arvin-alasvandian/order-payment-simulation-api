// models/idempotencyKey.js
const mongoose = require('mongoose');

const IdemSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  response: { type: Object, required: true }
}, { timestamps: true });

module.exports = mongoose.model('IdempotencyKey', IdemSchema);
