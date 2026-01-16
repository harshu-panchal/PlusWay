const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    guestId: { type: String }, // For non-logged in users check
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 },
        variant: {
            sku: String,
            name: String,
            price: Number
        }
    }]
}, { timestamps: true });

// Ensure we don't have duplicate carts for same user/guest
cartSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });
cartSchema.index({ guestId: 1 }, { unique: true, partialFilterExpression: { guestId: { $exists: true } } });

module.exports = mongoose.model('Cart', cartSchema);
