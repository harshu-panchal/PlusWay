const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'cycle', 'car'],
        default: 'bike'
    },
    vehicleNumber: {
        type: String
    },
    role: {
        type: String,
        default: 'delivery'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
deliveryBoySchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
deliveryBoySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
