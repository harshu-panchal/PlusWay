const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Portable speakers');
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
            filterableAttributes: ['Power Output', 'Connectivity', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('portable-speakers_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const extractSpecs = (title) => {
    const specs = [
        { label: 'Type', value: 'Portable Speaker' },
        { label: 'Connectivity', value: 'Bluetooth 5.0 / AUX / USB' }
    ];

    // Extract Power
    const powerMatch = title.match(/(\d+)w/i);
    if (powerMatch) {
        specs.push({ label: 'Power Output', value: `${powerMatch[1]}W RMS` });
    } else {
        specs.push({ label: 'Power Output', value: '20W Standard' });
    }

    // Extract Battery hint
    if (title.toLowerCase().includes('pro')) {
        specs.push({ label: 'Battery', value: '3000mAh (8-10 Hours)' });
    } else {
        specs.push({ label: 'Battery', value: '1500mAh (4-6 Hours)' });
    }

    specs.push({ label: 'Features', value: 'TWS Pairing, FM Radio' });

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Portable speakers', 0);

        if (await fs.pathExists(SOURCE_DIR)) {
            const files = await fs.readdir(SOURCE_DIR);
            const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

            console.log(`Found ${imageFiles.length} speakers.`);

            for (const file of imageFiles) {
                const filePath = path.join(SOURCE_DIR, file);
                const imageUrl = await uploadToCloudinary(filePath);
                if (!imageUrl) continue;

                const title = parseFilename(file);
                const specs = extractSpecs(title);

                // Price logic based on wattage
                let price = 1499;
                const pwrSpec = specs.find(s => s.label === 'Power Output');
                if (pwrSpec) {
                    const w = parseInt(pwrSpec.value);
                    if (w >= 40) price = 2999;
                    else if (w >= 20) price = 1999;
                }
                price += Math.floor(Math.random() * 300);

                const sku = `SPK-${Math.floor(Math.random() * 100000)}`;

                const product = new Product({
                    title: title,
                    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                    description: `Rich sound and deep bass with ${title}. Your perfect party companion.`,
                    category: rootCat._id,
                    rootCategory: rootCat._id,
                    basePrice: price,
                    stock: 45,
                    sku: sku,
                    mainImage: imageUrl,
                    images: [imageUrl],
                    hasVariants: false,
                    attributes: {
                        'Brand': 'Walker',
                        'Power Output': pwrSpec ? pwrSpec.value : '20W'
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
