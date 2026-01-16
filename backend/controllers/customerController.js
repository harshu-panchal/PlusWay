const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Address = require('../models/Address');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, city, startDate, endDate } = req.query;

        let query = {};

        // 1. Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // 2. Date Range Filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // 3. City Filter (Requires finding users with matching addresses)
        if (city) {
            // Find addresses matching the city
            const addresses = await Address.find({
                city: { $regex: city, $options: 'i' }
            }).select('user');

            const userIds = addresses.map(addr => addr.user);

            // Add user IDs to query (using $and to combine with search if needed)
            // If we already have query.$or or other fields, we need to be careful.
            // But here we are building the root query object.

            if (query.$or) {
                query = {
                    $and: [
                        { $or: query.$or },
                        { _id: { $in: userIds } },
                        ...(query.createdAt ? [{ createdAt: query.createdAt }] : [])
                    ]
                };
            } else {
                query._id = { $in: userIds };
            }
        }

        const total = await Customer.countDocuments(query);
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({
            success: true,
            count: customers.length,
            total,
            pages: Math.ceil(total / limit),
            data: customers
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single customer (with addresses and orders)
// @route   GET /api/customers/:id
// @access  Private/Admin
exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const addresses = await Address.find({ user: req.params.id });
        const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                ...customer._doc,
                addresses,
                orders
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
exports.updateCustomer = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Prevent changing password through this route if it was there
        delete req.body.password;

        customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        await customer.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
