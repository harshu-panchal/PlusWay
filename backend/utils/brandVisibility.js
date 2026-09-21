const Brand = require('../models/Brand');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAdminRequest = (req) => !!(req.user && req.user.role === 'admin');

// Names (lower-cased) of every brand that is currently hidden (isActive = false)
const getHiddenBrandNames = async () => {
    const hidden = await Brand.find({ isActive: false }).select('name').lean();
    return hidden.map((b) => b.name.trim().toLowerCase());
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
    return query;
};

const getProductBrand = (product) => {
    const attrs = product && product.attributes;
    if (!attrs) return null;
    const brand = attrs instanceof Map ? attrs.get('Brand') : attrs.Brand;
    return brand ? String(brand).trim().toLowerCase() : null;
};

// Single-document check (works for lean objects and mongoose documents)
const isProductHidden = async (product, req) => {
    if (isAdminRequest(req)) return false;
    const brand = getProductBrand(product);
    if (!brand) return false;
    const names = await getHiddenBrandNames();
    return names.includes(brand);
};

module.exports = { isAdminRequest, applyBrandVisibility, isProductHidden, getHiddenBrandNames, getProductBrand };
