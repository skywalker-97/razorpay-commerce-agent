const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String },
  addedViaAI: { type: Boolean, default: false },
  recommendationReason: { type: String },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  sessionId: { type: String },
  items: [cartItemSchema],
  coupon: { type: String },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'checkout', 'ordered', 'abandoned'], default: 'active' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

cartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.discount = this.coupon ? Math.round(this.subtotal * 0.05) : 0;
  const taxableAmount = this.subtotal - this.discount;
  this.tax = Math.round(taxableAmount * (this.taxRate / 100));
  this.total = taxableAmount + this.tax;
  return this;
};

module.exports = mongoose.model('Cart', cartSchema);
