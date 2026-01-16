const Deal = require('../models/Deal');

// Get the current active deal
exports.getActiveDeal = async (req, res) => {
    try {
        // Find the most recently updated active deal
        const deal = await Deal.findOne({ isActive: true }).sort({ updatedAt: -1 }).populate('product');
        if (!deal) {
            return res.status(404).json({ message: 'No active deal found' });
        }
        res.status(200).json(deal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Create or Update Deal (Single active deal logic)
exports.createDeal = async (req, res) => {
    try {
        const { product, title, originalPrice, dealPrice, discount, images, endDate } = req.body;

        // Optional: Deactivate all other deals if we want strict single-deal mode
        await Deal.updateMany({}, { isActive: false });

        const newDeal = new Deal({
            product,
            title,
            originalPrice,
            dealPrice,
            discount,
            images,
            endDate,
            isActive: true
        });

        await newDeal.save();
        res.status(201).json(newDeal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Deals (for admin list)
exports.getAllDeals = async (req, res) => {
    try {
        const deals = await Deal.find().sort({ createdAt: -1 }).populate('product', 'title image');
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Toggle Active Status
exports.toggleDealStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await Deal.findById(id);

        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        // If activating, deactivate others
        if (!deal.isActive) {
            await Deal.updateMany({}, { isActive: false });
        }

        deal.isActive = !deal.isActive;
        await deal.save();

        res.status(200).json(deal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete Deal
exports.deleteDeal = async (req, res) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
