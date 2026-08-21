const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, getRecommendations } = require('../controllers/productController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.get('/:id/recommendations', optionalAuth, getRecommendations);

module.exports = router;
