const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REQUEST',
      'AI_SEARCH_PRODUCTS',
      'AI_GET_PRODUCT',
      'AI_RECOMMENDATION',
      'CART_UPDATED',
      'CART_ITEM_REMOVED',
      'CART_CALCULATED',
      'CHECKOUT_PREVIEW_CREATED',
      'USER_PAYMENT_APPROVAL',
      'USER_PAYMENT_CANCELLED',
      'RAZORPAY_ORDER_CREATED',
      'PAYMENT_ATTEMPTED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'ORDER_CREATED',
      'PAYMENT_VERIFIED',
      'AI_TOOL_CALL',
      'AUTH_LOGIN',
      'AUTH_LOGOUT',
      'AUTH_REGISTER',
      'SYSTEM_ERROR',
    ]
  },
  toolName: { type: String },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'na'], default: 'na' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  status: { type: String, enum: ['success', 'failure', 'pending', 'info'], default: 'info' },
  error: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ sessionId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ status: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
