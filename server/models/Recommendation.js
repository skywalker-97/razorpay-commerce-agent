const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String },
  sourceProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  recommendedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  type: { type: String, enum: ['upsell', 'cross-sell', 'related', 'ai-personalized'], default: 'ai-personalized' },
  reason: { type: String },
  accepted: { type: Boolean, default: false },
  acceptedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
