const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Self-referencing for infinite depth
    level: { type: Number, default: 0 }, // 0 = Root (e.g. Glass), 1 = Brand (Apple), 2 = Model (iPhone 13)
    icon: { type: String }, // URL for the icon grid
    isFeatured: { type: Boolean, default: false }, // Show on homepage
    order: { type: Number, default: 0 },
    filterableAttributes: [{ type: String }] // e.g. ["Material", "Hardness", "Interface"]
}, { timestamps: true });

categorySchema.index({ parent: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
