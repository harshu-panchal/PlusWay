const Category = require('../models/Category');
const { isAdminRequest, getHiddenCategoryIds } = require('../utils/brandVisibility');

// Helper to generate slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        let { slug } = req.body;

        if (!slug && name) {
            slug = generateSlug(name);
        }

        const category = new Category({
            ...req.body,
            slug
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        // For now return flat list, tree conversion can happen on frontend or here
        let categories = await Category.find().sort({ level: 1, order: 1 });
        // Inactive categories (and their subcategories) are only returned to admins
        if (!isAdminRequest(req)) {
            const hidden = await getHiddenCategoryIds();
            categories = categories.filter((c) => !hidden.has(String(c._id)));
        }
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || (!isAdminRequest(req) && (await getHiddenCategoryIds()).has(String(category._id)))) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Helper to build hierarchy
const buildHierarchy = async (category) => {
    let hierarchy = [];
    let current = category;
    while (current) {
        hierarchy.unshift(current);
        if (current.parent) {
            current = await Category.findById(current.parent);
        } else {
            current = null;
        }
    }
    return hierarchy;
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const hidden = isAdminRequest(req) ? new Set() : await getHiddenCategoryIds();
        if (hidden.has(String(category._id))) return res.status(404).json({ error: 'Category not found' });

        const breadcrumbs = await buildHierarchy(category);

        // Find children (sub-categories)
        const children = (await Category.find({ parent: category._id })).filter((c) => !hidden.has(String(c._id)));

        res.json({
            category,
            breadcrumbs,
            children
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
