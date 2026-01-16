const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    console.log('Auth Debug - Cookies:', req.cookies ? 'Present' : 'None');
    console.log('Auth Debug - Token:', token ? 'Found' : 'Missing');
    // console.log('Auth Debug - Headers:', JSON.stringify(req.headers)); // Too noisy?

    // Make sure token exists and is not the string "null" or "undefined"

    // Make sure token exists and is not the string "null" or "undefined"
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('Decoded Token:', decoded);

        // Find user by decoded id and role
        if (decoded.role === 'admin') {
            req.user = await Admin.findById(decoded.id);
        } else if (decoded.role === 'delivery') {
            req.user = await DeliveryBoy.findById(decoded.id);
        } else {
            req.user = await Customer.findById(decoded.id);
        }

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({
            success: false,
            message: err.name === 'JsonWebTokenError' ? 'Invalid token' : 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional authentication (populates req.user if token exists, otherwise continues)
exports.optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'null') {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'admin') {
            req.user = await Admin.findById(decoded.id);
        } else if (decoded.role === 'delivery') {
            req.user = await DeliveryBoy.findById(decoded.id);
        } else {
            req.user = await Customer.findById(decoded.id);
        }

        next();
    } catch (err) {
        // If token invalid, just continue as guest
        next();
    }
};
