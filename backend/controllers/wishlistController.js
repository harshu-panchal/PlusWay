const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get my wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products', 'title basePrice mainImage slug hasVariants isOutOfStock'); // populate minimal fields

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.status(200).json({ success: true, count: wishlist.products.length, data: wishlist.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add/Remove item from wishlist
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        // Check if product exists in wishlist
        const index = wishlist.products.indexOf(productId);

        if (index > -1) {
            // Remove
            wishlist.products.splice(index, 1);
        } else {
            // Add
            wishlist.products.push(productId);
        }

        await wishlist.save();
        await wishlist.populate('products', 'title basePrice mainImage slug');

        res.status(200).json({ success: true, data: wishlist.products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
