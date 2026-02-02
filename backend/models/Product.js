const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },

    // Categorization
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // The deepest level (e.g. iPhone 13 Pro)
    rootCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // The top level (e.g. Protective Glass)

    // Searchable Attributes (Common to all variants or single product)
    attributes: {
        type: Map,
        of: String
    }, // e.g. { "Brand": "Apple", "Hardness": "9H" }

    // Pricing & Inventory (Base/Default)
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, default: 0 }, // Global stock if no variants
    sku: { type: String, unique: true },

    // Media
    mainImage: { type: String, required: true }, // Main display image
    images: [{ type: String }], // Gallery images
    thumbnail: { type: String },

    // Variant System
    // Example: For a "Glass" product, variants could be different models if we group them, 
    // OR if we sell "iPhone 13 Case" in different colors.
    // Walker.pro approach: "Protective Glass 3D for iPhone 13" is often a single product.
    // But they likely have "Select Model" dropdowns for some items.
    hasVariants: { type: Boolean, default: false },
    variants: [{
        name: { type: String }, // e.g. "Black", "128GB"
        sku: { type: String },
        price: { type: Number }, // Optional override
        stock: { type: Number },
        attributes: { type: Map, of: String } // { "Color": "Black", "Material": "Matte" }
    }],

    // Specifications (Tab content)
    specs: [{
        label: { type: String }, // e.g. "Hardness"
        value: { type: String }  // e.g. "9H"
    }],

    // Metadata
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    // Ratings
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' }

}, { timestamps: true });

// Text index for search
productSchema.index({ title: 'text', description: 'text' }, { weights: { title: 10, description: 1 } });
productSchema.index({ category: 1 });
productSchema.index({ rootCategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
