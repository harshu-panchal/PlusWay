const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to find cart
const getCartObj = async (req) => {
    const { userId, guestId } = req.query; // Or req.user from middleware
    // If we have a logged in user (assumed passed in query/body for now as auth is WIP)
    if (userId) return await Cart.findOne({ user: userId });
    if (guestId) return await Cart.findOne({ guestId });
    return null;
};

exports.getCart = async (req, res) => {
    try {
        const { userId, guestId } = req.query;
        if (!userId && !guestId) return res.json({ items: [] });

        let cart = await Cart.findOne({ $or: [{ user: userId }, { guestId }] }).populate('items.product');

        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, guestId, productId, quantity = 1, variant } = req.body;

        if (!userId && !guestId) return res.status(400).json({ error: 'User ID or Guest ID required' });

        let cart = await Cart.findOne({ $or: [{ user: userId }, { guestId }] });

        if (!cart) {
            cart = new Cart({
                user: userId,
                guestId: userId ? undefined : guestId,
                items: []
            });
        }

        // Check availability
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Logic to check if item exists (simple check on productId + variant SKU if exists)
        const itemIndex = cart.items.findIndex(p => {
            const sameProduct = p.product.toString() === productId;
            const sameVariant = (!p.variant && !variant) || (p.variant?.sku === variant?.sku);
            return sameProduct && sameVariant;
        });

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                variant
            });
        }

        await cart.save();
        // Repopulate for frontend
        await cart.populate('items.product');
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { userId, guestId, itemId, quantity } = req.body;

        let cart = await Cart.findOne({ $or: [{ user: userId }, { guestId }] });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const item = cart.items.id(itemId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) item.deleteOne();
            await cart.save();
        }

        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { userId, guestId, itemId } = req.body; // Using body for delete to pass IDs easily

        let cart = await Cart.findOne({ $or: [{ user: userId }, { guestId }] });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { userId, guestId } = req.body;
        let cart = await Cart.findOne({ $or: [{ user: userId }, { guestId }] });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared', items: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
