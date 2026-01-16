const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Portable batteries Power Banks');
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
            filterableAttributes: ['Capacity', 'Output Power', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('portable-batteries-power-banks_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const extractSpecs = (title) => {
    const specs = [
        { label: 'Type', value: 'Power Bank' }
    ];

    // Extract Capacity
    const capacityMatch = title.match(/(\d+)\s*mah/i);
    if (capacityMatch) {
        specs.push({ label: 'Capacity', value: `${capacityMatch[1]}mAh` });
    } else {
        specs.push({ label: 'Capacity', value: '10000mAh' }); // Default
    }

    // Extract Power
    const powerMatch = title.match(/(\d+)w/i);
    if (powerMatch) {
        specs.push({ label: 'Output Power', value: `${powerMatch[1]}W` });
        specs.push({ label: 'Fast Charging', value: 'Yes' });
    } else {
        specs.push({ label: 'Output Power', value: '10W Standard' });
    }

    // Extract Ports
    if (title.toLowerCase().includes('type-c')) {
        specs.push({ label: 'Input/Output', value: 'USB-C + USB-A' });
    } else {
        specs.push({ label: 'Input/Output', value: 'MicroUSB + USB-A' });
    }

    // Extract Cable
    if (title.toLowerCase().includes('cable')) {
        specs.push({ label: 'Included', value: 'Built-in Cable' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Portable batteries Power Banks', 0);

        if (await fs.pathExists(SOURCE_DIR)) {
            const files = await fs.readdir(SOURCE_DIR);
            const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

            console.log(`Found ${imageFiles.length} power banks.`);

            for (const file of imageFiles) {
                const filePath = path.join(SOURCE_DIR, file);
                const imageUrl = await uploadToCloudinary(filePath);
                if (!imageUrl) continue;

                const title = parseFilename(file);
                const specs = extractSpecs(title);

                // Determine price based on capacity
                let price = 999;
                const capSpec = specs.find(s => s.label === 'Capacity');
                if (capSpec) {
                    const cap = parseInt(capSpec.value);
                    if (cap >= 20000) price = 1999;
                    else if (cap >= 10000) price = 999;
                    else price = 699;
                }

                // Add random variance
                price += Math.floor(Math.random() * 200);

                const sku = `PB-${Math.floor(Math.random() * 100000)}`;

                const product = new Product({
                    title: title,
                    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                    description: `Stay charged on the go with ${title}. Reliable power for your devices.`,
                    category: rootCat._id,
                    rootCategory: rootCat._id, // Flat category
                    basePrice: price,
                    stock: 80,
                    sku: sku,
                    mainImage: imageUrl,
                    images: [imageUrl],
                    hasVariants: false,
                    attributes: {
                        'Brand': 'Walker',
                        'Capacity': capSpec ? capSpec.value : '10000mAh'
                    },
                    specs: specs,
                    status: 'active'
                });

                await product.save();
                console.log(`Inserted: ${title}`);
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
