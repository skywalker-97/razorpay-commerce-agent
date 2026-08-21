const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  failureReason: { type: String },
  verifiedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
