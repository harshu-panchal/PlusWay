const express = require('express');
const { addReview, getProductReviews, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/', protect, authorize('admin'), getAllReviews); // Admin get all
router.get('/product/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
