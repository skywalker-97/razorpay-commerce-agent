const express = require('express');
const router = express.Router();
const { getDashboard, getProducts, getOrders } = require('../controllers/merchantController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('merchant', 'admin'));
router.get('/dashboard', getDashboard);
router.get('/products', getProducts);
router.get('/orders', getOrders);

module.exports = router;
