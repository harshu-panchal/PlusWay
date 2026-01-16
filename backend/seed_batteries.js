const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

// Config
const IMAGES_DIR = path.resolve(__dirname, '../scraper_tool/product images/Batteries for phones');
const CLOUDINARY_FOLDER = 'plusway_products';

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(filePath) {
    try {
        console.log(`Uploading ${path.basename(filePath)}...`);
        const result = await cloudinary.uploader.upload(filePath, {
            folder: CLOUDINARY_FOLDER,
            use_filename: true,
            unique_filename: false
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error.message);
        return null; // Handle smoothly
    }
}

async function ensureCategory(name, level = 0, parentIdx = null) {
    let query = { name: new RegExp('^' + name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'), level };
    if (parentIdx) query.parent = parentIdx;

    let cat = await Category.findOne(query);
    if (!cat) {
        console.log(`Creating category: ${name} (L${level})`);
        cat = await Category.create({
            name: name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            level,
            parent: parentIdx,
            filterableAttributes: ['Brand', 'Compatibility', 'Capacity']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    // Expected: batteries-for-phones_phone-battery-deji-for-apple-iphone-11-3110mah.jpg
    const namePart = path.basename(filename, path.extname(filename));
    // Remove prefix if present
    const cleanName = namePart.replace('batteries-for-phones_', '').replace(/_/g, ' ').replace(/-/g, ' ');

    // Capitalize
    const title = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title,
        original: cleanName
    };
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Ensure Root Category
        const rootCat = await ensureCategory('Batteries for phones', 0);

        // 2. Scan Files
        const files = await fs.readdir(IMAGES_DIR);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

        console.log(`Found ${imageFiles.length} images.`);

        for (const file of imageFiles) {
            const filePath = path.join(IMAGES_DIR, file);

            // Upload
            const imageUrl = await uploadToCloudinary(filePath);
            if (!imageUrl) continue;

            const { title, original } = parseFilename(file);

            // Simple Logic to find brand/model from text for subcategories
            // "Phone Battery Deji For Apple Iphone 11 3110mah"
            // Brand: Apple? Or Deji? "For Apple" implies compatibility.
            // Let's make "Apple" the Level 1 category if detected.

            let parentCat = rootCat;
            let currentCat = rootCat;

            // Detect Brand
            const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google'];
            const brand = brands.find(b => title.includes(b));

            if (brand) {
                const brandCat = await ensureCategory(brand, 1, rootCat._id);
                parentCat = brandCat;
                currentCat = brandCat; // Default to brand if no model found

                // Detect Model (Simple heuristic)
                // "Iphone 11"
                // regex?
                const modelMatch = title.match(/(iPhone\s\w+(\s\w+)?|Galaxy\s\w+|Redmi\s\w+)/i);
                if (modelMatch) {
                    const modelName = modelMatch[0];
                    currentCat = await ensureCategory(modelName, 2, brandCat._id);
                }
            }

            // Specs inference
            const capMatch = title.match(/(\d+)\s?mah/i);
            const capacity = capMatch ? capMatch[0].toUpperCase() : 'Standard';

            // Create Product
            const sku = `BAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const price = 500 + Math.floor(Math.random() * 2000); // 500-2500

            const product = new Product({
                title: title,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                description: `High quality replacement battery ${title}. Restores your phone's battery life.`,
                category: currentCat._id,
                rootCategory: rootCat._id,
                basePrice: price,
                stock: 50,
                sku: sku,
                mainImage: imageUrl,
                images: [imageUrl], // Just one for now
                hasVariants: false,
                attributes: {
                    'Brand': 'DEJI', // Hardcoded as per filename hint, or dynamic
                    'Compatibility': brand || 'Universal',
                    'Capacity': capacity
                },
                specs: [
                    { label: 'Capacity', value: capacity },
                    { label: 'Warranty', value: '6 Months' },
                    { label: 'Manufacturer', value: 'DEJI' }
                ],
                status: 'active'
            });

            await product.save();
            console.log(`Inserted: ${title}`);
        }

        console.log('Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

seed();
