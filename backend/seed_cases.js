const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Cases and straps');
const CLOUDINARY_FOLDER = 'plusway_products';

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
            filterableAttributes: ['Model Compatibility', 'Material', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename, subcatName) => {
    // "for-iphone_case-with-magsafe-aerocool-for-apple-iphone-17-air-with-stand-black-01.jpg"
    const namePart = path.basename(filename, path.extname(filename));
    // Remove known prefixes based on subcat or general
    let clean = namePart
        .replace(subcatName.toLowerCase().replace(/\s+/g, '-') + '_', '') // for-iphone_
        .replace('cases-and-straps_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    // Capitalize
    return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const extractModel = (title, subcatName) => {
    if (subcatName.toLowerCase().includes('iphone')) {
        // Match numbers + optional suffix (Pro, Max, Plus, Air, e)
        // e.g. iPhone 17 Pro Max
        const match = title.match(/iPhone\s(\d+(\s(Pro|Max|Plus|Air|e|Mini))*)?/i);
        // Clean match to just numbers + suffix
        if (match) {
            // "iPhone 17 Pro Max" -> we want "17 Pro Max" if possible, or just seed "17 Pro Max"
            // Let's grab the part AFTER "iPhone "
            const parts = match[0].split('iPhone ');
            if (parts.length > 1 && parts[1].trim()) return parts[1].trim();
        }
    }
    // Samsung logic
    if (subcatName.toLowerCase().includes('samsung')) {
        const match = title.match(/Galaxy\s(\w+)/i);
        if (match) return match[0]; // "Galaxy S24"
    }
    return null;
};

const getSpecs = (title) => {
    return [
        { label: 'Type', value: 'Protective Case' },
        { label: 'Material', value: title.toLowerCase().includes('silicone') ? 'Silicone' : 'TPU/Polycarbonate' },
        { label: 'Feature', value: title.toLowerCase().includes('magsafe') ? 'MagSafe Supported' : 'Standard' }
    ];
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Cases and straps', 0);

        if (await fs.pathExists(SOURCE_DIR)) {
            const subDirs = await fs.readdir(SOURCE_DIR);

            for (const dir of subDirs) {
                const fullPath = path.join(SOURCE_DIR, dir);
                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    console.log(`Processing Subfolder: ${dir}`);

                    // Create Level 1: "For iPhone", "Samsung"
                    const subCat = await ensureCategory(dir, 1, rootCat._id);

                    const files = await fs.readdir(fullPath);
                    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

                    for (const file of imageFiles) {
                        const filePath = path.join(fullPath, file);
                        const imageUrl = await uploadToCloudinary(filePath);
                        if (!imageUrl) continue;

                        const title = parseFilename(file, dir);

                        // Infer Level 2 Model
                        const model = extractModel(title, dir);
                        let finalCat = subCat;

                        // If model found, ensure Level 2 category exists (e.g. "17 Pro Max")
                        if (model) {
                            finalCat = await ensureCategory(model, 2, subCat._id);
                        }

                        const sku = `CS-${finalCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;
                        const price = 499 + Math.floor(Math.random() * 1500);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Stylish and durable protection: ${title}.`,
                            category: finalCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 200,
                            sku: sku,
                            mainImage: imageUrl,
                            images: [imageUrl],
                            hasVariants: false,
                            attributes: {
                                'Brand': 'Walker',
                                'Model Compatibility': model || 'Universal'
                            },
                            specs: getSpecs(title),
                            status: 'active'
                        });

                        await product.save();
                        console.log(`Inserted: ${title} -> [${finalCat.name}]`);
                    }
                }
            }
        } else {
            console.log('Source directory not found!');
        }

        console.log('Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

seed();
