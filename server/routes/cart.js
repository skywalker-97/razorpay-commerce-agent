const express = require('express');
const router = express.Router();
const { getUserCart, addItem, removeItem, updateQuantity, clearCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getUserCart);
router.post('/add', addItem);
router.delete('/remove/:productId', removeItem);
router.put('/quantity', updateQuantity);
router.delete('/clear', clearCart);

module.exports = router;
