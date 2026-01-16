const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Category = require('../models/Category');

exports.getAnalyticsData = async (req, res) => {
    try {
        // 1. Total Revenue, Total Orders, Total Customers
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await Customer.countDocuments();
        // Just for reference, count products and categories here too if needed, but dashboard calls separate endpoint below

        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // 2. Sales Over Time (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesOverTime = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    paymentStatus: 'Paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Orders by Status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Top Selling Products
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.variant.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.price" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $project: {
                    name: { $ifNull: ["$name", { $arrayElemAt: ["$productDetails.name", 0] }] },
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalRevenue,
                    totalOrders,
                    totalCustomers
                },
                salesOverTime,
                ordersByStatus,
                topProducts
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching analytics" });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalCustomers = await Customer.countDocuments();

        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // Recent Activity - get last 5 orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        const recentActivities = recentOrders.map(order => ({
            id: order._id,
            type: 'order',
            message: `New order received #${order._id.toString().slice(-6).toUpperCase()}`,
            time: order.createdAt,
            status: 'success'
        }));

        res.status(200).json({
            success: true,
            stats: [
                { label: 'Total Products', value: totalProducts, trend: '+0%' },
                { label: 'Total Categories', value: totalCategories, trend: '+0%' },
                { label: 'Total Customers', value: totalCustomers, trend: '+0%' },
                { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, trend: '+0%' }
            ],
            recentActivities
        });

    } catch (error) {
        console.error("Dashboard Data Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching dashboard data" });
    }
};
