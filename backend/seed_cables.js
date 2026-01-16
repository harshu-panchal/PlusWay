const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

// Config
const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Cables and adapters');
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
        return null;
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
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
            level,
            parent: parentIdx,
            filterableAttributes: ['Length', 'Connector Type', 'Color', 'Brand']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    // Remove typical prefixes if any (adjusted for cables folder naming)
    // Files might be "cables-and-adapters_usb-cable...", need to be flexible
    let cleanName = namePart
        .replace('cables-and-adapters_', '')
        .replace('show-all-products_', '') // specific cleaner
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    // Capitalize
    const title = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return title;
};

const getCableSpecs = (subcatName, title) => {
    // Infer simple specs
    let length = '1m';
    if (title.includes('2m') || title.includes('200cm')) length = '2m';
    if (title.includes('3m')) length = '3m';
    if (title.includes('0.2m') || title.includes('20cm')) length = '0.2m';

    let material = 'PVC';
    if (title.toLowerCase().includes('braid') || title.toLowerCase().includes('nylon')) material = 'Nylon Braided';
    if (title.toLowerCase().includes('silicone')) material = 'Liquid Silicone';

    return [
        { label: 'Length', value: length },
        { label: 'Material', value: material },
        { label: 'Connector', value: subcatName.replace('cables', '').trim() }
    ];
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Ensure Root Category
        const rootCat = await ensureCategory('Cables and adapters', 0);

        // 2. Scan Subdirectories
        const subDirs = await fs.readdir(SOURCE_DIR);

        for (const dir of subDirs) {
            const fullPath = path.join(SOURCE_DIR, dir);
            const stats = await fs.stat(fullPath);

            if (stats.isDirectory()) {
                console.log(`Processing Subfolder: ${dir}`);

                // Ensure Subcategory (Level 1)
                const subCat = await ensureCategory(dir, 1, rootCat._id);

                // Get Files
                const files = await fs.readdir(fullPath);
                const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

                for (const file of imageFiles) {
                    const filePath = path.join(fullPath, file);

                    // Upload
                    const imageUrl = await uploadToCloudinary(filePath);
                    if (!imageUrl) continue;

                    const title = parseFilename(file);

                    // Create Product
                    const sku = `CBL-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 10000)}`;
                    const price = 299 + Math.floor(Math.random() * 1000); // 299-1299

                    const product = new Product({
                        title: title,
                        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                        description: `Premium ${title}. Durable and fast charging support.`,
                        category: subCat._id, // deepest level
                        rootCategory: rootCat._id,
                        basePrice: price,
                        stock: 100,
                        sku: sku,
                        mainImage: imageUrl,
                        images: [imageUrl],
                        hasVariants: false,
                        attributes: {
                            'Brand': 'Walker',
                            'Connector Type': dir.replace('cables', '').trim(),
                            'Color': 'Black/White' // Placeholder
                        },
                        specs: getCableSpecs(dir, title),
                        status: 'active'
                    });

                    await product.save();
                    console.log(`Inserted: ${title} in ${dir}`);
                }
            }
        }

        console.log('Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

seed();
