const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getProductBySlug, updateProduct, updateStock, getRecommendations } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.put('/:id/stock', protect, authorize('admin'), updateStock);
router.get('/:id/recommendations', getRecommendations);

module.exports = router;
