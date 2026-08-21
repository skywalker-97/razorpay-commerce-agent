const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditController');
const { authenticate, requireRole } = require('../middleware/auth');

// All authenticated users can access; controller scopes by role
router.get('/', authenticate, getLogs);

module.exports = router;
