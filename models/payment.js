const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  method: { type: String, required: true, enum: ['card', 'wallet', 'bank'] },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, enum: ['GBP', 'USD', 'EUR'] },
  status: { type: String, required: true, enum: ['SUCCEEDED', 'FAILED'] }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
