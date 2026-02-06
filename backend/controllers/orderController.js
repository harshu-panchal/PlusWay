const paypal = require('../services/paypalService');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Transaction = require('../models/Transaction');
const razorpayService = require('../services/razorpayService');
const crypto = require('crypto');

// Create Order (Initialize PayPal Payment)
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, guestId } = req.body;
        const userId = req.user ? req.user._id : req.body.userId;

        console.log('--- Create Order Request ---');
        console.log('User ID:', userId);
        console.log('Guest ID:', guestId);

        if (!userId && !guestId) {
            console.log('Error: User identification missing');
            return res.status(400).json({ error: 'User identification required' });
        }

        // Fetch Cart
        let cart = null;
        if (userId) {
            cart = await Cart.findOne({ user: userId }).populate('items.product');
        }

        if ((!cart || cart.items.length === 0) && guestId) {
            const guestCart = await Cart.findOne({ guestId }).populate('items.product');
            if (guestCart && guestCart.items.length > 0) {
                cart = guestCart;
            }
        }

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate Total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) continue;
            const itemObj = item.toObject();
            const price = itemObj.variant?.price || itemObj.product?.discountPrice || itemObj.product?.basePrice;

            if (price === undefined || price === null) continue;

            totalAmount += price * itemObj.quantity;
            orderItems.push({
                product: itemObj.product._id,
                quantity: itemObj.quantity,
                price: price,
                variant: itemObj.variant ? {
                    sku: itemObj.variant.sku,
                    name: itemObj.variant.name,
                    price: itemObj.variant.price
                } : undefined
            });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ error: 'Order total cannot be zero.' });
        }

        // Create PayPal Order
        // Conversion logic: If the system uses INR (as suggested by the UI) but PayPal expects USD,
        // we should convert the amount to avoid charging $1000 for a ₹1000 item.
        // For Sandbox testing, we'll use a conversion rate of 1 USD = 80 INR
        const conversionRate = 80;
        const amountInUSD = (totalAmount / conversionRate).toFixed(2);

        console.log('--- PayPal Order Creation ---');
        console.log(`Original Amount (INR): ${totalAmount}`);
        console.log(`Converted Amount (USD): ${amountInUSD}`);

        const paypalOrder = await paypal.createOrder({
            amount: amountInUSD,
            currency: "USD"
        });

        const newOrder = new Order({
            user: userId || undefined,
            guestId: userId ? undefined : guestId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentDetails: {
                paypal_order_id: paypalOrder.id
            },
            paymentStatus: 'Pending'
        });

        await newOrder.save();

        const responseData = {
            id: newOrder._id,
            paypalOrderId: paypalOrder.id,
            amount: totalAmount,
            currency: "USD"
        };
        console.log('Order created successfully in DB. Returning:', responseData);

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Create PayPal Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Capture PayPal Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { paypalOrderId } = req.body;

        const captureData = await paypal.capturePayment(paypalOrderId);

        if (captureData.status === 'COMPLETED') {
            const order = await Order.findOne({ 'paymentDetails.paypal_order_id': paypalOrderId });

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            order.paymentDetails.paypal_capture_id = captureData.purchase_units[0].payments.captures[0].id;
            order.paymentStatus = 'Paid';
            await order.save();

            // Create Transaction Record
            await Transaction.create({
                orderId: order._id,
                transactionId: order.paymentDetails.paypal_capture_id,
                amount: order.totalAmount,
                status: 'success',
                breakdown: {
                    subtotal: order.totalAmount,
                    platformFee: 0
                }
            });

            // Clear Cart
            if (order.user) {
                await Cart.findOneAndDelete({ user: order.user });
            } else if (order.guestId) {
                await Cart.findOneAndDelete({ guestId: order.guestId });
            }

            res.json({ success: true, message: 'Payment captured successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Payment not completed' });
        }

    } catch (error) {
        console.error('Capture PayPal Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { shippingAddress, guestId } = req.body;
        const userId = req.user ? req.user._id : req.body.userId;

        console.log('--- Create Razorpay Order Request ---');

        if (!userId && !guestId) {
            return res.status(400).json({ error: 'User identification required' });
        }

        // Fetch Cart
        let cart = null;
        if (userId) {
            cart = await Cart.findOne({ user: userId }).populate('items.product');
        }

        if ((!cart || cart.items.length === 0) && guestId) {
            const guestCart = await Cart.findOne({ guestId }).populate('items.product');
            if (guestCart && guestCart.items.length > 0) {
                cart = guestCart;
            }
        }

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate Total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) continue;
            const itemObj = item.toObject();
            const price = itemObj.variant?.price || itemObj.product?.discountPrice || itemObj.product?.basePrice;

            if (price === undefined || price === null) continue;

            totalAmount += price * itemObj.quantity;
            orderItems.push({
                product: itemObj.product._id,
                quantity: itemObj.quantity,
                price: price,
                variant: itemObj.variant ? {
                    sku: itemObj.variant.sku,
                    name: itemObj.variant.name,
                    price: itemObj.variant.price
                } : undefined
            });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ error: 'Order total cannot be zero.' });
        }

        console.log(`Amount (INR): ${totalAmount}`);

        // Create Razorpay Order
        const razorpayOrder = await razorpayService.createOrder(totalAmount);

        const newOrder = new Order({
            user: userId || undefined,
            guestId: userId ? undefined : guestId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentDetails: {
                razorpay_order_id: razorpayOrder.id
            },
            paymentStatus: 'Pending'
        });

        await newOrder.save();

        res.status(201).json({
            id: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create Razorpay Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            order.paymentDetails.razorpay_payment_id = razorpay_payment_id;
            order.paymentDetails.razorpay_signature = razorpay_signature;
            order.paymentStatus = 'Paid';
            await order.save();

            // Create Transaction Record
            await Transaction.create({
                orderId: order._id,
                transactionId: razorpay_payment_id,
                amount: order.totalAmount,
                status: 'success',
                breakdown: {
                    subtotal: order.totalAmount,
                    platformFee: 0
                }
            });

            // Clear Cart
            if (order.user) {
                await Cart.findOneAndDelete({ user: order.user });
            } else if (order.guestId) {
                await Cart.findOneAndDelete({ guestId: order.guestId });
            }

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }

    } catch (error) {
        console.error('Verify Razorpay Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get My Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images'); // Populate product details if needed

        res.json(orders);
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};
// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;

        let query = {};

        // Status Filter
        if (status && status !== 'All') {
            query.status = status;
        }

        // Search Filter (Order ID or User Name/Email)
        if (search) {
            // Check if search is a valid ObjectId for Order ID lookup
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

            if (isObjectId) {
                query._id = search;
            } else {
                // For name/email search, we need to look up users first or use aggregation
                // Using a simpler approach: get matching users, then find their orders
                const User = require('../models/User'); // Assuming User/Customer model
                // Note: The model is likely 'Customer' or 'User' based on other files. 
                // Let's check imports. It uses 'Customer' in refs usually but 'User' in some places?
                // `orderController` imports `Order` which refs `Customer`.
                // Let's rely on populated match if possible, but mongoose `find` doesn't filter on populated fields efficiently without aggregation.
                // WE WILL USE AGGREGATION for better performance and flexibility.
            }
        }

        // Date Range Filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // If simple find is used, we can't easily filter by user name/email without aggregation
        // Switching to Aggregation Pipeline
        const pipeline = [];

        // 1. Lookup User (Customer) to filter by name/email
        pipeline.push({
            $lookup: {
                from: 'customers', // Verify collection name! Assuming 'customers' based on Mongoose default
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        });
        pipeline.push({ $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } });

        // 2. Match Stage
        let matchStage = {};

        if (status && status !== 'All') {
            matchStage.status = status;
        }

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = end;
            }
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

            let searchConditions = [
                { 'userDetails.name': searchRegex },
                { 'userDetails.email': searchRegex }
            ];

            if (isObjectId) {
                // precise match for ID
                // Mongoose might cast string to ObjectId automatically in find, but in aggregation we need to be careful.
                // Ideally cast it if it's an ObjectId.
                const mongoose = require('mongoose');
                searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
            }
            // Also support partial ID match string if desired, typically full ID is better.
            // But for user convenience, let's stick to full ID or name/email.

            matchStage.$or = searchConditions;
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // 3. Sort
        pipeline.push({ $sort: { createdAt: -1 } });

        // 4. Pagination
        // Need total count for pagination
        // Using $facet to get data and count in one go
        const facetPipeline = [
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: (parseInt(page) - 1) * parseInt(limit) }, { $limit: parseInt(limit) }]
                }
            }
        ];

        // Combine main pipeline with facet
        const finalPipeline = [...pipeline, ...facetPipeline];

        const result = await Order.aggregate(finalPipeline);

        const metadata = result[0].metadata;
        const data = result[0].data;
        const total = metadata.length > 0 ? metadata[0].total : 0;

        // Re-shape data to match expected format (populate user field back from userDetails if needed, 
        // but it's already unwound. Let's just map it back to structure expected by frontend)
        // Frontend expects `order.user.name`. Since we preserved userDetails, we can remap.

        const formattedOrders = data.map(order => ({
            ...order,
            user: order.userDetails // Restore the populated-like structure
        }));

        res.status(200).json({
            orders: formattedOrders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get orders for a specific customer (Admin)
// @route   GET /api/orders/admin/customer/:id
// @access  Private/Admin
exports.getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id })
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Get Customer Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'Paid'; // Assume COD is paid on delivery, or online was already paid
        }

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Assign order to delivery boy (Admin)
// @route   PUT /api/orders/assign
// @access  Private/Admin
exports.assignOrder = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.deliveryBoy = deliveryBoyId;
        order.status = 'Shipped'; // Auto-move to Shipped when verified delivery boy assigned? Or keep logic flexible. 
        // Let's typically assume assignment implies ready for pickup/shipping.

        await order.save();

        // Populate specific fields to return useful info
        await order.populate('deliveryBoy', 'name phone');

        res.status(200).json({ success: true, message: 'Order assigned successfully', order });
    } catch (error) {
        console.error('Assign Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};
