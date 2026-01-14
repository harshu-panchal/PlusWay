const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
    try {
        const { position } = req.query;
        const query = { isActive: true };
        if (position) query.position = position;

        const banners = await Banner.find(query).sort({ order: 1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllBannersAdmin = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ position: 1, order: 1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const banner = new Banner(req.body);
        await banner.save();
        res.status(201).json(banner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!banner) return res.status(404).json({ error: 'Banner not found' });
        res.json(banner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ error: 'Banner not found' });
        res.json({ message: 'Banner deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
