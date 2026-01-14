const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getProductBySlug } = require('../controllers/productController');

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

module.exports = router;
