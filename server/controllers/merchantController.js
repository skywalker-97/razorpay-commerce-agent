const Order = require('../models/Order');
const Product = require('../models/Product');
const Merchant = require('../models/Merchant');
const AuditLog = require('../models/AuditLog');

// GET /api/merchant/dashboard
const getDashboard = async (req, res) => {
  try {
    const merchantId = req.user.merchantId;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

    const orders = await Order.find({ merchantId }).sort({ createdAt: -1 }).limit(100);
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const aiOrders = orders.filter(o => o.isAIAssisted);
    const upsellRevenue = orders.reduce((s, o) => s + (o.upsellAmount || 0), 0);

    // Monthly revenue for chart
    const monthlyRevenue = {};
    orders.forEach(o => {
      const month = new Date(o.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total;
    });

    const revenueChart = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

    res.json({
      success: true,
      merchant,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
        aiAssistedOrders: aiOrders.length,
        aiConversionRate: orders.length ? ((aiOrders.length / orders.length) * 100).toFixed(1) : 0,
        upsellRevenue,
        aiAssistedRevenue: aiOrders.reduce((s, o) => s + o.total, 0),
      },
      revenueChart,
      recentOrders: orders.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/merchant/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ merchantId: req.user.merchantId }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/merchant/orders
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { merchantId: req.user.merchantId };
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getProducts, getOrders };
