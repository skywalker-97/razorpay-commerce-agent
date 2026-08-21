const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    const filter = { isActive: true, stock: { $gt: 0 } };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('merchantId', 'businessName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchantId', 'businessName')
      .populate('upsellProducts', 'name price image')
      .populate('crossSellProducts', 'name price image')
      .populate('relatedProducts', 'name price image');

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id/recommendations
const getRecommendations = async (req, res) => {
  try {
    const { getProductRecommendations } = require('../services/agentTools');
    const result = await getProductRecommendations({
      productId: req.params.id,
      userId: req.user?._id,
      sessionId: req.headers['x-session-id'],
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProduct, getCategories, getRecommendations };
