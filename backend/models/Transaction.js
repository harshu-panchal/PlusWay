const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    transactionId: {
        type: String, // Razorpay payment ID
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    type: {
        type: String,
        enum: ['income', 'refund'],
        default: 'income'
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    paymentMethod: {
        type: String
    },
    breakdown: {
        subtotal: Number,
        tax: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 } // Razorpay roughly 2-3%
    },
    metadata: {
        type: Map,
        of: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
