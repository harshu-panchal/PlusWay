const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart); // Using POST to body params easier or DELETE with query
router.post('/clear', clearCart);

module.exports = router;
