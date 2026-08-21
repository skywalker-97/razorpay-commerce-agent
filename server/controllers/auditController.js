const auditService = require('../services/auditService');

// GET /api/audit
const getLogs = async (req, res) => {
  try {
    const { userId, sessionId, action, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (req.user.role === 'customer') filter.userId = req.user._id;
    else if (userId) filter.userId = userId;
    if (sessionId) filter.sessionId = sessionId;
    if (action) filter.action = action;
    if (status) filter.status = status;

    const result = await auditService.getLogs({ ...filter, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLogs };
