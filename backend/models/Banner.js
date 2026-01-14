const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '/'
    },
    position: {
        type: String,
        enum: ['hero', 'side', 'bottom-grid'],
        default: 'hero'
    },
    bgColor: {
        type: String, // Tailwind classes e.g. 'from-cyan-400 to-cyan-600'
        default: 'from-gray-800 to-gray-900'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
