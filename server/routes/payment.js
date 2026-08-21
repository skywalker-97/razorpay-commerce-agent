const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, handleFailure, getStatus } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handleFailure);
router.get('/status/:orderId', getStatus);

module.exports = router;
