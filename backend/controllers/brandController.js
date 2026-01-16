const Brand = require('../models/Brand');

// Get all brands
exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ order: 1, createdAt: -1 });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single brand
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Brand not found' });
        res.json(brand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create brand
exports.createBrand = async (req, res) => {
    try {
        const { name, logo, isActive, order } = req.body;

        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({ error: 'Brand already exists' });
        }

        const brand = new Brand({
            name,
            logo,
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0
        });

        await brand.save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update brand
exports.updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Brand not found' });

        if (req.body.name) brand.name = req.body.name;
        if (req.body.logo) brand.logo = req.body.logo;
        if (req.body.isActive !== undefined) brand.isActive = req.body.isActive;
        if (req.body.order !== undefined) brand.order = req.body.order;

        await brand.save();
        res.json(brand);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Brand not found' });
        res.json({ message: 'Brand deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
