const Brand = require('../models/Brand');
const Category = require('../models/Category');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAdminRequest = (req) => !!(req.user && req.user.role === 'admin');

// Names (lower-cased) of every brand that is currently hidden (isActive = false)
const getHiddenBrandNames = async () => {
    const hidden = await Brand.find({ isActive: false }).select('name').lean();
    return hidden.map((b) => b.name.trim().toLowerCase());
};

// Ids (strings) of inactive categories plus everything nested beneath them
const getHiddenCategoryIds = async () => {
    const all = await Category.find().select('_id parent isActive').lean();
    const hidden = new Set(all.filter((c) => c.isActive === false).map((c) => String(c._id)));
    if (hidden.size === 0) return hidden;
    let grew = true;
    while (grew) {
        grew = false;
        for (const c of all) {
            if (c.parent && hidden.has(String(c.parent)) && !hidden.has(String(c._id))) {
                hidden.add(String(c._id));
                grew = true;
            }
        }
    }
    return hidden;
};

/**
 * A product belongs to a brand when its `attributes.Brand` equals the brand
 * name (case-insensitive). Returns a Mongo condition that matches products of
 * hidden brands, or null when no brand is hidden.
 */
const getHiddenBrandCondition = async () => {
    const names = await getHiddenBrandNames();
    if (names.length === 0) return null;
    return {
        'attributes.Brand': { $in: names.map((n) => new RegExp(`^\\s*${escapeRegex(n)}\\s*$`, 'i')) }
    };
};

// Adds "exclude products of hidden brands" to a product query for non-admin callers
const applyBrandVisibility = async (query, req) => {
    if (isAdminRequest(req)) return query;
    const condition = await getHiddenBrandCondition();
    if (condition) {
        query.$nor = [...(query.$nor || []), condition];
    }
    const hiddenCategories = [...await getHiddenCategoryIds()];
    if (hiddenCategories.length > 0) {
        query.$nor = [...(query.$nor || []), { category: { $in: hiddenCategories } }, { rootCategory: { $in: hiddenCategories } }];
    }
    return query;
};

const getProductBrand = (product) => {
    const attrs = product && product.attributes;
    if (!attrs) return null;
    const brand = attrs instanceof Map ? attrs.get('Brand') : attrs.Brand;
    return brand ? String(brand).trim().toLowerCase() : null;
};

// Single-document check (works for lean objects and mongoose documents)
const refId = (ref) => (ref ? String(ref._id || ref) : null);

const isProductHidden = async (product, req) => {
    if (isAdminRequest(req)) return false;
    const brand = getProductBrand(product);
    if (brand && (await getHiddenBrandNames()).includes(brand)) return true;
    const hiddenCategories = await getHiddenCategoryIds();
    return hiddenCategories.size > 0 &&
        [refId(product.category), refId(product.rootCategory)].some((id) => id && hiddenCategories.has(id));
};

module.exports = { isAdminRequest, applyBrandVisibility, isProductHidden, getHiddenBrandNames, getProductBrand, getHiddenCategoryIds };
