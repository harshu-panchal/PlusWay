const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Customer)
exports.addReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            rating: Number(rating),
            comment,
            product: productId,
            user: req.user._id
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin/Review Owner)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure user owns review or is admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await review.deleteOne(); // Trigger 'remove' hook

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name email')
            .populate('product', 'title mainImage')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
