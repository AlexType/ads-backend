const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: Number,
  currency: {
    type: String,
    default: 'RUB'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'electronic_wallet']
  },
  transactionId: String,
  processedAt: Date,
  completedAt: Date
}, { timestamps: true });

paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

