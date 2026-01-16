const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// @desc    Get financial statistics for dashboard
// @route   GET /api/finance/stats
// @access  Private/Admin
exports.getFinancialStats = async (req, res) => {
    try {
        const stats = await Transaction.aggregate([
            { $match: { status: 'success' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalFees: { $sum: '$breakdown.platformFee' },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalRevenue: 0, totalFees: 0, transactionCount: 0 };
        result.netRevenue = result.totalRevenue - result.totalFees;

        // Daily revenue for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyRevenue = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: result,
                charts: dailyRevenue
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all transactions with filtering
// @route   GET /api/finance/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const query = {};

        if (status) query.status = status;
        if (type) query.type = type;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .populate('orderId', 'status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limit),
            data: transactions
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
