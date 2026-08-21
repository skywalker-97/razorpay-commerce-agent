const express = require('express');
const router = express.Router();
const { getOrders, getOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;
