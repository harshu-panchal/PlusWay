const Order = require('../models/Order');
const DeliveryBoy = require('../models/DeliveryBoy');

// @desc    Get all delivery boys (Admin)
// @route   GET /api/delivery/admin/all
// @access  Private/Admin
exports.getAllDeliveryBoys = async (req, res) => {
    try {
        const deliveryBoys = await DeliveryBoy.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: deliveryBoys });
    } catch (error) {
        console.error('Get All Delivery Boys Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a delivery boy (Admin)
// @route   POST /api/delivery/admin/create
// @access  Private/Admin
exports.createDeliveryBoy = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

        const deliveryBoyExists = await DeliveryBoy.findOne({ email });
        if (deliveryBoyExists) {
            return res.status(400).json({ success: false, message: 'Delivery boy already exists' });
        }

        const deliveryBoy = await DeliveryBoy.create({
            name,
            email,
            password,
            phone,
            vehicleType,
            vehicleNumber
        });

        res.status(201).json({ success: true, data: deliveryBoy });
    } catch (error) {
        console.error('Create Delivery Boy Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update delivery boy (Admin)
// @route   PUT /api/delivery/admin/:id
// @access  Private/Admin
exports.updateDeliveryBoy = async (req, res) => {
    try {
        const { name, email, phone, vehicleType, vehicleNumber, isActive } = req.body;

        const deliveryBoy = await DeliveryBoy.findById(req.params.id);

        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        }

        deliveryBoy.name = name || deliveryBoy.name;
        deliveryBoy.email = email || deliveryBoy.email;
        deliveryBoy.phone = phone || deliveryBoy.phone;
        deliveryBoy.vehicleType = vehicleType || deliveryBoy.vehicleType;
        deliveryBoy.vehicleNumber = vehicleNumber || deliveryBoy.vehicleNumber;
        if (isActive !== undefined) deliveryBoy.isActive = isActive;

        if (req.body.password) {
            deliveryBoy.password = req.body.password;
        }

        const updatedDeliveryBoy = await deliveryBoy.save();

        res.status(200).json({ success: true, data: updatedDeliveryBoy });
    } catch (error) {
        console.error('Update Delivery Boy Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete delivery boy (Admin)
// @route   DELETE /api/delivery/admin/:id
// @access  Private/Admin
exports.deleteDeliveryBoy = async (req, res) => {
    try {
        const deliveryBoy = await DeliveryBoy.findById(req.params.id);

        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        }

        await deliveryBoy.deleteOne();

        res.status(200).json({ success: true, message: 'Delivery boy removed' });
    } catch (error) {
        console.error('Delete Delivery Boy Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get orders assigned to logged-in delivery boy
// @route   GET /api/delivery/assigned
// @access  Private/Delivery
exports.getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryBoy: req.user.id,
            status: { $nin: ['Delivered', 'Cancelled'] } // Only active orders
        })
            .populate('user', 'name phone')
            .sort({ createdAt: 1 }); // Oldest first? or newest? usually urgent first

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Get Assigned Orders Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update delivery status (Picked Up, Out for Delivery, Delivered)
// @route   PUT /api/delivery/orders/:id/status
// @access  Private/Delivery
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Picked Up', 'Out for Delivery', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            deliveryBoy: req.user.id
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
        }

        order.status = status;

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'Paid'; // Mark COD as paid upon delivery
        }

        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Update Delivery Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get delivery history (Delivered orders)
// @route   GET /api/delivery/history
// @access  Private/Delivery
exports.getDeliveryHistory = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryBoy: req.user.id,
            status: 'Delivered'
        })
            .populate('user', 'name phone') // Basic customer details
            .sort({ deliveredAt: -1 }); // Recently delivered first

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Get Delivery History Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get delivery profile stats
// @route   GET /api/delivery/profile
// @access  Private/Delivery
exports.getProfile = async (req, res) => {
    try {
        const deliveredCount = await Order.countDocuments({
            deliveryBoy: req.user.id,
            status: 'Delivered'
        });

        const activeCount = await Order.countDocuments({
            deliveryBoy: req.user.id,
            status: { $nin: ['Delivered', 'Cancelled'] }
        });

        res.status(200).json({
            success: true,
            data: {
                ...req.user.toObject(),
                stats: {
                    delivered: deliveredCount,
                    active: activeCount
                }
            }
        });
    } catch (error) {
        console.error('Get Delivery Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
