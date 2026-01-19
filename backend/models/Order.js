const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    guestId: {
        type: String
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        variant: {
            sku: String,
            name: String,
            price: Number,
            _id: false
        },
        price: { // Store the price at time of purchase
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    paymentDetails: {
        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryBoy'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Processing'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
