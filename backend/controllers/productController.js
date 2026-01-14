const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const Category = require('../models/Category');

exports.getProducts = async (req, res) => {
    try {
        const { categorySlug, sort, minPrice, maxPrice, ...attributeFilters } = req.query;
        let query = {};

        // 1. Filter by Category (including children) if slug provided
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                // Find all sub-categories recursively or just one level?
                // For now, let's just do one level + root match.
                // Ideally we'd use $graphLookup, but let's keep it simple:
                // Find all categories where parent is THIS category, or just match this ID.
                // Or better: find all categories that have this one as ancestor.
                // Simplest: direct ID or parent ID.
                const childCats = await Category.find({ parent: category._id }).select('_id');
                const catIds = [category._id, ...childCats.map(c => c._id)];

                query.category = { $in: catIds };
            }
        }

        // 2. Price Filter
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = Number(minPrice);
            if (maxPrice) query.basePrice.$lte = Number(maxPrice);
        }

        // 3. Dynamic Attribute Filters
        // attributes are passed like: ?Color=Red&Material=Glass
        // We need to map them to `variants.attributes.Color` or distinct specs?
        // Let's assume aggregation needed for deep filtering, but for now simple find:
        // Problem: Attributes are in `variants` array or `specs`.
        // Walker has "Characteristics" on product level mostly. 
        // Let's assume we filter on Main Product Specs if consistent, or Variants.
        // For simplified implementation, we will skip complex attribute query for this step 
        // until we finalize data structure. (Will be added in next refinement).

        // Sorting
        let sortOption = {};
        if (sort === 'price_asc') sortOption.basePrice = 1;
        if (sort === 'price_desc') sortOption.basePrice = -1;
        if (sort === 'newest') sortOption.createdAt = -1;

        const products = await Product.find(query)
            .sort(sortOption)
            .populate('category')
            .populate('rootCategory');

        // Aggregation for Facets (Filters)
        // We want to know available Brands, Colors, etc. for the CURRENT query.
        // This usually requires a separate aggregation pipeline.

        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('rootCategory');

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category')
            .populate('rootCategory');

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
