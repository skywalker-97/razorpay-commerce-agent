const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  addedViaAI: { type: Boolean, default: false },
  recommendationReason: { type: String },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  isAIAssisted: { type: Boolean, default: false },
  hasUpsell: { type: Boolean, default: false },
  upsellAmount: { type: Number, default: 0 },
  sessionId: { type: String },
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
  notes: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
