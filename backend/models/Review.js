const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    },
    images: [{
        type: String // URLs for review images
    }]
}, { timestamps: true });

// Prevent user from submitting multiple reviews for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (productId) {
    const obj = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('Product').findByIdAndUpdate(productId, {
            averageRating: obj[0] ? obj[0].averageRating : 0,
            numReviews: obj[0] ? obj[0].numReviews : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
reviewSchema.post('remove', function () {
    this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
