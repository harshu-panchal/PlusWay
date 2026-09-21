const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Register customer
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Create customer
        const customer = await Customer.create({
            name,
            email,
            password
        });

        sendTokenResponse(customer, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Register delivery boy
// @route   POST /api/auth/register-delivery
// @access  Public
exports.registerDelivery = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

        const deliveryBoy = await DeliveryBoy.create({
            name,
            email,
            password,
            phone,
            vehicleType,
            vehicleNumber
        });

        sendTokenResponse(deliveryBoy, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user (Customer or Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Try to find in Admin first (usually fewer admins, faster check)
        let user = await Admin.findOne({ email }).select('+password');
        let role = 'admin';

        if (!user) {
            // Try Delivery Boy
            user = await DeliveryBoy.findOne({ email }).select('+password');
            role = 'delivery';
        }

        if (!user) {
            // Try Customer
            user = await Customer.findOne({ email }).select('+password');
            role = 'customer';
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is already populated by protect middleware
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete own customer account and personal data
// @route   DELETE /api/auth/me
// @access  Private (customer)
exports.deleteAccount = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Only customer accounts can be deleted here' });
        }

        const { password } = req.body || {};
        if (!password) {
            return res.status(400).json({ success: false, message: 'Please confirm your password to delete your account' });
        }

        const customer = await Customer.findById(req.user._id).select('+password');
        if (!customer || !(await customer.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        const userId = customer._id;

        // Reviews: remove and refresh the rating of every product they reviewed
        const reviews = await Review.find({ user: userId }).select('product');
        await Review.deleteMany({ user: userId });
        const reviewedProducts = [...new Set(reviews.map((r) => r.product.toString()))];
        await Promise.all(reviewedProducts.map((id) => Review.getAverageRating(new mongoose.Types.ObjectId(id))));

        await Promise.all([
            Address.deleteMany({ user: userId }),
            Cart.deleteMany({ user: userId }),
            Wishlist.deleteMany({ user: userId })
        ]);

        // Orders are kept for accounting / tax records but are no longer linked to the person.
        // Personal details are wiped on finished orders; orders still being fulfilled keep the
        // shipping address until they are delivered or cancelled.
        await Order.updateMany(
            { user: userId, status: { $in: ['Delivered', 'Cancelled'] } },
            {
                $set: {
                    'shippingAddress.fullName': 'Deleted User',
                    'shippingAddress.phone': 'Deleted',
                    'shippingAddress.addressLine': 'Deleted'
                }
            }
        );
        await Order.updateMany({ user: userId }, { $unset: { user: '' } });

        await customer.deleteOne();

        res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};
