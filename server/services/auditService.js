const AuditLog = require('../models/AuditLog');

const auditService = {
  async log({ userId, sessionId, action, toolName, input, output, amount, currency, approvalStatus, orderId, paymentId, razorpayOrderId, status, error, ipAddress, userAgent, metadata }) {
    try {
      const log = new AuditLog({
        userId,
        sessionId,
        action,
        toolName,
        input: input ? JSON.parse(JSON.stringify(input)) : undefined,
        output: output ? JSON.parse(JSON.stringify(output)) : undefined,
        amount,
        currency: currency || 'INR',
        approvalStatus: approvalStatus || 'na',
        orderId,
        paymentId,
        razorpayOrderId,
        status: status || 'info',
        error,
        ipAddress,
        userAgent,
        metadata,
      });
      await log.save();
      return log;
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
  },

  async getLogs({ userId, sessionId, action, status, limit = 50, page = 1 }) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (sessionId) filter.sessionId = sessionId;
    if (action) filter.action = action;
    if (status) filter.status = status;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber total')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return { logs, total, pages: Math.ceil(total / limit), page: parseInt(page) };
  },

  async getSessionLogs(sessionId) {
    return AuditLog.find({ sessionId }).sort({ createdAt: 1 });
  },
};

module.exports = auditService;
