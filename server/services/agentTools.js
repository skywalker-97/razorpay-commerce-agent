const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Recommendation = require('../models/Recommendation');
const auditService = require('./auditService');

async function resolveProduct(productIdOrName) {
  if (!productIdOrName) return null;
  if (productIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
    return await Product.findById(productIdOrName);
  }
  return await Product.findOne({ name: { $regex: productIdOrName, $options: 'i' } });
}

// Tool: searchProducts
async function searchProducts({ query, maxPrice, category, userId, sessionId }) {
  const filter = { isActive: true, stock: { $gt: 0 } };
  
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ];
  }
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };
  if (category) filter.category = { $regex: category, $options: 'i' };

  const products = await Product.find(filter).limit(6).lean();

  await auditService.log({
    userId, sessionId,
    action: 'AI_SEARCH_PRODUCTS',
    toolName: 'searchProducts',
    input: { query, maxPrice, category },
    output: { count: products.length, productIds: products.map(p => p._id) },
    status: 'success',
  });

  return { products, count: products.length };
}

// Tool: getProduct
async function getProduct({ productId, userId, sessionId }) {
  if (!productId) throw new Error('Product ID is required');
  const product = await resolveProduct(productId);
  if (!product) throw new Error('Product not found');
  
  // Need to populate for getProduct specifically, so we'll just do another query if we resolved it by name
  const fullProduct = await Product.findById(product._id).populate('relatedProducts upsellProducts crossSellProducts').lean();

  await auditService.log({
    userId, sessionId,
    action: 'AI_GET_PRODUCT',
    toolName: 'getProduct',
    input: { productId },
    output: { productId, name: product.name },
    status: 'success',
  });

  return product;
}

// Tool: getProductRecommendations
async function getProductRecommendations({ productId, userId, sessionId }) {
  const resolved = await resolveProduct(productId);
  if (!resolved) throw new Error(`Product not found for: ${productId}`);
  const product = await Product.findById(resolved._id).lean();

  // Get upsell/cross-sell from product settings, then fallback to category-based
  let recommendations = [];
  if (product.upsellProducts?.length > 0) {
    const upsells = await Product.find({ _id: { $in: product.upsellProducts }, isActive: true }).limit(3).lean();
    recommendations = [...recommendations, ...upsells.map(p => ({ ...p, type: 'upsell', reason: `Customers who bought ${product.name} frequently also buy this.` }))];
  }
  if (product.crossSellProducts?.length > 0) {
    const crossSells = await Product.find({ _id: { $in: product.crossSellProducts }, isActive: true }).limit(3).lean();
    recommendations = [...recommendations, ...crossSells.map(p => ({ ...p, type: 'cross-sell', reason: `Frequently bought together with ${product.name}.` }))];
  }

  // Fallback: same-category products
  if (recommendations.length < 3) {
    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
      stock: { $gt: 0 },
    }).limit(3).lean();
    related.forEach(p => {
      if (!recommendations.find(r => r._id.toString() === p._id.toString())) {
        recommendations.push({ ...p, type: 'related', reason: `Other popular products in ${product.category}.` });
      }
    });
  }

  const rec = await Recommendation.create({
    userId,
    sessionId,
    sourceProductId: product._id,
    recommendedProductIds: recommendations.map(r => r._id),
    type: 'upsell',
    reason: `AI-powered recommendations for ${product.name}`,
  });

  await auditService.log({
    userId, sessionId,
    action: 'AI_RECOMMENDATION',
    toolName: 'getProductRecommendations',
    input: { productId },
    output: { count: recommendations.length, recommendations: recommendations.map(r => ({ id: r._id, name: r.name, type: r.type })) },
    status: 'success',
  });

  return { recommendations: recommendations.slice(0, 4), sourceProduct: product };
}

// Tool: addToCart
async function addToCart({ cartId, productId, quantity = 1, userId, sessionId, addedViaAI = true, recommendationReason }) {
  if (!productId) throw new Error('Product ID is required');
  if (quantity < 1) throw new Error('Quantity must be at least 1');

  const product = await resolveProduct(productId);
  if (!product || !product.isActive) throw new Error('Product not found or unavailable');
  if (product.stock < quantity) throw new Error(`Only ${product.stock} units available in stock`);

  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
  }
  if (!cart && userId) {
    cart = await Cart.findOne({ userId, status: 'active' });
  }
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if item already in cart
  const existingItem = cart.items.find(i => i.productId.toString() === productId.toString());
  if (existingItem) {
    existingItem.quantity += quantity;
    if (existingItem.quantity > product.stock) throw new Error(`Cannot add more than ${product.stock} units`);
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
      price: product.price,
      name: product.name,
      image: product.image,
      addedViaAI,
      recommendationReason,
    });
  }

  cart.calculateTotals();
  await cart.save();

  await auditService.log({
    userId, sessionId,
    action: 'CART_UPDATED',
    toolName: 'addToCart',
    input: { productId, quantity, addedViaAI },
    output: { cartId: cart._id, total: cart.total, itemCount: cart.items.length },
    amount: cart.total,
    status: 'success',
  });

  return { cart: cart.toObject(), message: `${product.name} added to cart` };
}

// Tool: removeFromCart
async function removeFromCart({ cartId, productId, userId, sessionId }) {
  const cart = cartId
    ? await Cart.findById(cartId)
    : await Cart.findOne({ userId, status: 'active' });
  
  if (!cart) throw new Error('Cart not found');

  const product = await resolveProduct(productId);
  const actualProductId = product ? product._id.toString() : productId.toString();

  cart.items = cart.items.filter(i => i.productId.toString() !== actualProductId);
  cart.calculateTotals();
  await cart.save();

  await auditService.log({
    userId, sessionId,
    action: 'CART_ITEM_REMOVED',
    toolName: 'removeFromCart',
    input: { cartId: cart._id, productId },
    output: { total: cart.total, itemCount: cart.items.length },
    amount: cart.total,
    status: 'success',
  });

  return { cart: cart.toObject(), message: 'Item removed from cart' };
}

// Tool: getCart
async function getCart({ cartId, userId, sessionId }) {
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId).populate('items.productId');
  } else if (userId) {
    cart = await Cart.findOne({ userId, status: 'active' }).populate('items.productId');
  }

  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }

  return cart.toObject();
}

// Tool: calculateCart
async function calculateCart({ cartId, userId, sessionId }) {
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
  } else if (userId) {
    cart = await Cart.findOne({ userId, status: 'active' });
  }
  if (!cart) throw new Error('Cart not found');

  cart.calculateTotals();
  await cart.save();

  await auditService.log({
    userId, sessionId,
    action: 'CART_CALCULATED',
    toolName: 'calculateCart',
    input: { cartId: cart._id },
    output: { subtotal: cart.subtotal, tax: cart.tax, discount: cart.discount, total: cart.total },
    amount: cart.total,
    status: 'success',
  });

  return {
    subtotal: cart.subtotal,
    discount: cart.discount,
    tax: cart.tax,
    total: cart.total,
    items: cart.items,
  };
}

// Tool: createCheckoutPreview
async function createCheckoutPreview({ cartId, userId, sessionId }) {
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId).populate('items.productId');
  } else if (userId) {
    cart = await Cart.findOne({ userId, status: 'active' }).populate('items.productId');
  }
  if (!cart) throw new Error('Cart not found');
  if (cart.items.length === 0) throw new Error('Cart is empty');

  cart.calculateTotals();
  await cart.save();

  const preview = {
    merchant: 'SportZone India',
    cart: cart.toObject(),
    items: cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      addedViaAI: item.addedViaAI,
      recommendationReason: item.recommendationReason,
    })),
    pricing: {
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      taxRate: cart.taxRate,
      total: cart.total,
    },
    currency: 'INR',
    paymentMethods: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
    requiresExplicitApproval: true,
    warning: 'Payment will NOT proceed without your explicit confirmation.',
  };

  await auditService.log({
    userId, sessionId,
    action: 'CHECKOUT_PREVIEW_CREATED',
    toolName: 'createCheckoutPreview',
    input: { cartId: cart._id },
    output: { total: cart.total, itemCount: cart.items.length },
    amount: cart.total,
    approvalStatus: 'pending',
    status: 'success',
  });

  return preview;
}

// Tool: createRazorpayOrder (server-side only, called from payment controller)
async function createRazorpayOrder({ cartId, userId, sessionId }) {
  // This delegates to the payment controller
  throw new Error('Use the payment API endpoint to create Razorpay orders');
}

// Tool: getPaymentStatus
async function getPaymentStatus({ orderId, userId, sessionId }) {
  const Payment = require('../models/Payment');
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) throw new Error('Payment not found');
  return { status: payment.status, amount: payment.amount, currency: payment.currency };
}

// Tool: createOrder
async function createOrder({ cartId, paymentId, userId, sessionId }) {
  // Delegated to order controller
  throw new Error('Use the order API endpoint to create orders');
}

const agentTools = [
  {
    name: 'searchProducts',
    description: 'Search for products by query, price limit, and category. Use this when user asks to find, search, or browse products.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        maxPrice: { type: 'number', description: 'Maximum price in INR' },
        category: { type: 'string', description: 'Product category filter' },
      },
    },
    fn: searchProducts,
  },
  {
    name: 'getProduct',
    description: 'Get detailed information about a specific product by ID.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'The product ID' },
      },
      required: ['productId'],
    },
    fn: getProduct,
  },
  {
    name: 'getProductRecommendations',
    description: 'Get AI-powered upsell and cross-sell recommendations for a product. Call this when the user asks what goes well with a product, asks for recommendations, suggestions, or complementary products. You can pass the product NAME as productId (e.g. "Nike Air Zoom Running Shoes") — the system will resolve it automatically. Do NOT call searchProducts for recommendation requests.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'The product ID OR product name to get recommendations for (e.g. "Nike Air Zoom Running Shoes" or a MongoDB ID)' },
      },
      required: ['productId'],
    },
    fn: getProductRecommendations,
  },
  {
    name: 'addToCart',
    description: 'Add a product to the shopping cart. Always confirm with the user before adding.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID to add' },
        quantity: { type: 'number', description: 'Quantity to add (default 1)' },
        recommendationReason: { type: 'string', description: 'Why this was recommended' },
      },
      required: ['productId'],
    },
    fn: addToCart,
  },
  {
    name: 'removeFromCart',
    description: 'Remove a product from the shopping cart.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID to remove' },
      },
      required: ['productId'],
    },
    fn: removeFromCart,
  },
  {
    name: 'getCart',
    description: 'Get the current cart contents and totals.',
    parameters: {
      type: 'object',
      properties: {},
    },
    fn: getCart,
  },
  {
    name: 'calculateCart',
    description: 'Calculate cart totals including subtotal, tax, and discounts.',
    parameters: {
      type: 'object',
      properties: {},
    },
    fn: calculateCart,
  },
  {
    name: 'createCheckoutPreview',
    description: 'Generate a full checkout preview with all pricing details. Call this before payment to show the user exactly what they will pay.',
    parameters: {
      type: 'object',
      properties: {},
    },
    fn: createCheckoutPreview,
  },
];

module.exports = { agentTools, searchProducts, getProduct, getProductRecommendations, addToCart, removeFromCart, getCart, calculateCart, createCheckoutPreview };
