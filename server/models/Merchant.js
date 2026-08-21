const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  logo: { type: String },
  description: { type: String },
  category: { type: String },
  gstNumber: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  settings: {
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 18 },
    enableUpsell: { type: Boolean, default: true },
    enableAIRecommendations: { type: Boolean, default: true },
  },
  stats: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    upsellRevenue: { type: Number, default: 0 },
    aiAssistedRevenue: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Merchant', merchantSchema);
