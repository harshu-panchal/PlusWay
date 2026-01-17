const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');

const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.use(optionalProtect); // Try to get user from token if present

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart); // Using POST to body params easier or DELETE with query
router.post('/clear', clearCart);

module.exports = router;
