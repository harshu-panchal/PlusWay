const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    street: {
        type: String,
        required: [true, 'Please add a street address']
    },
    city: {
        type: String,
        required: [true, 'Please add a city']
    },
    state: {
        type: String,
        required: [true, 'Please add a state']
    },
    zipCode: {
        type: String,
        required: [true, 'Please add a zip code']
    },
    country: {
        type: String,
        required: [true, 'Please add a country']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
