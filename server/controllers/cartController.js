const Cart = require('../models/Cart');
const { addToCart, removeFromCart, getCart, calculateCart } = require('../services/agentTools');
const auditService = require('../services/auditService');

// GET /api/cart
const getUserCart = async (req, res) => {
  try {
    const cart = await getCart({ userId: req.user._id, sessionId: req.headers['x-session-id'] });
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart/add
const addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const result = await addToCart({
      userId: req.user._id,
      productId,
      quantity,
      sessionId: req.headers['x-session-id'],
      addedViaAI: false,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message.includes('stock') ? 400 : err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/remove/:productId
const removeItem = async (req, res) => {
  try {
    const result = await removeFromCart({
      userId: req.user._id,
      productId: req.params.productId,
      sessionId: req.headers['x-session-id'],
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/quantity
const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id, status: 'active' });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }
    cart.calculateTotals();
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id, status: 'active' });
    if (cart) {
      cart.items = [];
      cart.calculateTotals();
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserCart, addItem, removeItem, updateQuantity, clearCart };
