const express = require('express');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/toggle/:productId', protect, toggleWishlist);

module.exports = router;
