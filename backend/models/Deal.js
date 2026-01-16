const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    dealPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number, // Percentage
        required: true
    },
    images: [{
        type: String, // URLs of the 3 images
        required: true
    }],
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure only one deal is active at a time? Or just fetch the latest active one.
// We'll handle "only one active" logic in the controller or just pick the first one.

module.exports = mongoose.model('Deal', dealSchema);
