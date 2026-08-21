const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['discount', 'upsell', 'bundle', 'seasonal'], default: 'discount' },
  discountPercent: { type: Number, min: 0, max: 100 },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  stats: {
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
