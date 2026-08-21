const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Merchant = require('../models/Merchant');
const auditService = require('../services/auditService');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || keyId === 'rzp_test_YOUR_KEY_ID' || !keySecret || keySecret === 'YOUR_KEY_SECRET') {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  const userId = req.user._id;
  const sessionId = req.headers['x-session-id'];

  try {
    const { cartId } = req.body;

    // Find cart - ALWAYS calculate server-side, NEVER trust client amount
    let cart;
    if (cartId) {
      cart = await Cart.findById(cartId);
    } else {
      cart = await Cart.findOne({ userId, status: 'active' });
    }
    
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    if (cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    // Calculate server-side (never trust client)
    cart.calculateTotals();
    await cart.save();

    if (cart.total < 1) return res.status(400).json({ success: false, message: 'Invalid cart total' });

    const razorpay = getRazorpayInstance();

    // Amount in paise (smallest currency unit)
    const amountInPaise = Math.round(cart.total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
      },
    });

    // Save payment record
    const payment = await Payment.create({
      userId,
      cartId: cart._id,
      razorpayOrderId: razorpayOrder.id,
      amount: cart.total,
      currency: 'INR',
      status: 'created',
    });

    await auditService.log({
      userId, sessionId,
      action: 'RAZORPAY_ORDER_CREATED',
      input: { cartId: cart._id },
      output: { razorpayOrderId: razorpayOrder.id, amount: cart.total },
      amount: cart.total,
      razorpayOrderId: razorpayOrder.id,
      approvalStatus: 'pending',
      status: 'success',
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      cartTotal: cart.total,
    });
  } catch (err) {
    await auditService.log({
      userId, sessionId,
      action: 'RAZORPAY_ORDER_CREATED',
      error: err.message,
      status: 'failure',
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const userId = req.user._id;
  const sessionId = req.headers['x-session-id'];

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, cartId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' });
    }

    // Verify signature server-side
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      await auditService.log({
        userId, sessionId,
        action: 'PAYMENT_FAILED',
        razorpayOrderId,
        paymentId: razorpayPaymentId,
        error: 'Signature verification failed',
        status: 'failure',
      });
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        verifiedAt: new Date(),
        attempts: 1,
      },
      { new: true }
    );

    // Get cart
    let cart;
    if (cartId) {
      cart = await Cart.findById(cartId);
    } else {
      cart = await Cart.findOne({ userId, status: 'active' });
    }
    
    if (cart) {
      cart.status = 'ordered';
      await cart.save();
    }

    // Create Order
    const orderItems = cart?.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      addedViaAI: item.addedViaAI,
      recommendationReason: item.recommendationReason,
    })) || [];

    const hasUpsell = orderItems.some(i => i.addedViaAI);
    const upsellAmount = orderItems.filter(i => i.addedViaAI).reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId,
      cartId: cart?._id,
      items: orderItems,
      subtotal: cart?.subtotal || 0,
      discount: cart?.discount || 0,
      tax: cart?.tax || 0,
      total: cart?.total || 0,
      razorpayOrderId,
      razorpayPaymentId,
      paymentId: payment._id,
      status: 'confirmed',
      isAIAssisted: true,
      hasUpsell,
      upsellAmount,
      sessionId,
    });

    // Update merchant stats
    if (cart?.merchantId) {
      await Merchant.findByIdAndUpdate(cart.merchantId, {
        $inc: {
          'stats.totalRevenue': cart.total,
          'stats.totalOrders': 1,
          'stats.upsellRevenue': upsellAmount,
          'stats.aiAssistedRevenue': cart.total,
        }
      });
    }

    // Update product sales counts
    for (const item of orderItems) {
      if (item.productId) {
        const Product = require('../models/Product');
        await Product.findByIdAndUpdate(item.productId, { $inc: { salesCount: item.quantity, stock: -item.quantity } });
      }
    }

    await auditService.log({
      userId, sessionId,
      action: 'PAYMENT_SUCCESS',
      razorpayOrderId,
      paymentId: razorpayPaymentId,
      orderId: order._id,
      amount: cart?.total,
      approvalStatus: 'approved',
      status: 'success',
    });

    await auditService.log({
      userId, sessionId,
      action: 'ORDER_CREATED',
      orderId: order._id,
      amount: order.total,
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Payment verified and order created',
      orderId: order._id,
      orderNumber: order.orderNumber,
      order,
    });
  } catch (err) {
    await auditService.log({
      userId, sessionId,
      action: 'SYSTEM_ERROR',
      error: err.message,
      status: 'failure',
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/failure
const handleFailure = async (req, res) => {
  const userId = req.user._id;
  const sessionId = req.headers['x-session-id'];

  try {
    const { razorpayOrderId, reason, code, amount } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'failed', failureReason: reason, $inc: { attempts: 1 } },
      { new: true }
    );

    const attemptNumber = payment?.attempts || 1;
    const failedAmount = amount || payment?.amount;

    await auditService.log({
      userId,
      sessionId,
      action: 'PAYMENT_FAILED',
      razorpayOrderId,
      amount: failedAmount,
      error: reason || 'Payment failed by user or bank',
      status: 'failure',
      approvalStatus: 'rejected',
      input: {
        razorpayOrderId,
        reason: reason || 'Payment failed by user or bank',
        failureCode: code || 'UNKNOWN',
        attemptNumber,
      },
      output: {
        paymentStatus: 'failed',
        canRetry: payment ? attemptNumber < payment.maxAttempts : true,
        attemptsUsed: attemptNumber,
        maxAttempts: payment?.maxAttempts || 3,
        amountFailed: failedAmount,
        autoRetry: false,
      },
      metadata: { code, attemptNumber },
    });

    res.json({
      success: true,
      message: 'Payment failure recorded. No automatic retry initiated.',
      canRetry: payment ? attemptNumber < payment.maxAttempts : true,
      attempts: attemptNumber,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payment/status/:orderId
const getStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ razorpayOrderId: req.params.orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, handleFailure, getStatus };
