const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String },
  stock: { type: Number, default: 100, min: 0 },
  image: { type: String },
  images: [{ type: String }],
  tags: [{ type: String }],
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  upsellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  crossSellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  salesCount: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ merchantId: 1 });

module.exports = mongoose.model('Product', productSchema);
