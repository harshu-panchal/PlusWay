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
        const {
            categorySlug,
            sort,
            minPrice,
            maxPrice,
            search,
            stockStatus,
            status,
            isFeatured,
            isNewArrival,
            page = 1,
            limit = 20,
            ...attributeFilters
        } = req.query;

        let query = {};

        // 1. Search (Title or SKU)
        if (search) {
            query.$text = { $search: search };
        }

        // 2. Status Filter
        if (status && status !== 'All') {
            query.status = status;
        }

        if (isFeatured === 'true') query.isFeatured = true;
        if (isNewArrival === 'true') query.isNewArrival = true;

        // 3. Stock Status
        if (stockStatus) {
            if (stockStatus === 'in_stock') {
                query.$or = [
                    { stock: { $gt: 0 } },
                    { 'variants.stock': { $gt: 0 } }
                ];
            } else if (stockStatus === 'out_of_stock') {
                query.$and = [
                    { stock: { $lte: 0 } },
                    { 'variants.stock': { $lte: 0 } } // Simplification: strict out of stock means NO variants have stock either
                ];
            }
        }

        // 4. Filter by Category
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                const childCats = await Category.find({ parent: category._id }).select('_id');
                const catIds = [category._id, ...childCats.map(c => c._id)];

                // Check if this is a leaf category (no children)
                const isLeafCategory = childCats.length === 0;

                if (isLeafCategory) {
                    // For leaf categories, search by category ID OR by category name in title
                    // This handles sub-subcategories like "14 Plus" that may not have products directly assigned
                    const categoryCondition = {
                        $or: [
                            { category: { $in: catIds } },
                            { title: { $regex: category.name, $options: 'i' } }
                        ]
                    };

                    // Combine with existing $or from search if present
                    if (query.$or) {
                        query.$and = query.$and || [];
                        query.$and.push({ $or: query.$or });
                        query.$and.push(categoryCondition);
                        delete query.$or;
                    } else {
                        query.$or = categoryCondition.$or;
                    }
                } else {
                    // For parent categories, filter by category ID and children
                    query.category = { $in: catIds };
                }
            }
        }

        // 5. Price Filter
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = Number(minPrice);
            if (maxPrice) query.basePrice.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = {};
        if (sort === 'price_asc') sortOption.basePrice = 1;
        else if (sort === 'price_desc') sortOption.basePrice = -1;
        else if (sort === 'oldest') sortOption.createdAt = 1;
        else sortOption.createdAt = -1; // Default to newest


        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .populate('category')
            .populate('rootCategory')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        res.json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('rootCategory')
            .lean();

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
            .populate('rootCategory')
            .lean();

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { variantSku, stock, variantId } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (variantId || variantSku) {
            // Update Variant Stock
            // Note: variantSku might not be unique globally, so relying on variantId if possible, or sku within product
            const variantIndex = product.variants.findIndex(v =>
                (variantId && v._id.toString() === variantId) ||
                (variantSku && v.sku === variantSku)
            );

            if (variantIndex === -1) {
                return res.status(404).json({ error: 'Variant not found' });
            }

            product.variants[variantIndex].stock = stock;
        } else {
            // Update Base Stock
            product.stock = stock;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        let recommendations = [];
        const excludeIds = [product._id];

        // 1. Level 1: Same strict Category
        const sameCategory = await Product.find({
            category: product.category,
            _id: { $nin: excludeIds },
            status: 'active'
        })
            .limit(8)
            .populate('category');

        recommendations = [...sameCategory];
        recommendations.forEach(p => excludeIds.push(p._id));

        // 2. Level 2: Same Root Category (if we need more and have a rootCategory)
        if (recommendations.length < 4 && product.rootCategory) {
            const limit = 4 - recommendations.length;
            const sameRoot = await Product.find({
                rootCategory: product.rootCategory,
                _id: { $nin: excludeIds },
                status: 'active'
            })
                .limit(limit * 2) // Fetch a bit more to be safe
                .populate('category');

            recommendations = [...recommendations, ...sameRoot];
            sameRoot.forEach(p => excludeIds.push(p._id));
        }

        // 3. Level 3: Fallback to "Best Sellers" or general random products to ensure list isn't empty
        if (recommendations.length < 4) {
            const limit = 4 - recommendations.length;
            const fallback = await Product.find({
                _id: { $nin: excludeIds },
                status: 'active'
            })
                .sort({ isBestSeller: -1, createdAt: -1 }) // Prioritize best sellers
                .limit(limit)
                .populate('category');

            recommendations = [...recommendations, ...fallback];
        }

        // Slice to ensure we generally don't send too many if we over-fetched in steps
        res.json(recommendations.slice(0, 8));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
