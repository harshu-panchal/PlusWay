const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getProductBySlug, updateProduct, updateStock, getRecommendations } = require('../controllers/productController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', createProduct);
router.get('/', optionalProtect, getProducts);
router.get('/slug/:slug', optionalProtect, getProductBySlug);
router.get('/:id', optionalProtect, getProductById);
router.put('/:id', updateProduct);
router.put('/:id/stock', protect, authorize('admin'), updateStock);
router.get('/:id/recommendations', optionalProtect, getRecommendations);

module.exports = router;
