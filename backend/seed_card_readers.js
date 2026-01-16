const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Card readers');
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
            filterableAttributes: ['Interface', 'Card Support', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('card-readers_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getSpecs = (title) => {
    const specs = [
        { label: 'Type', value: 'Card Reader' }
    ];

    if (title.toLowerCase().includes('type-c')) specs.push({ label: 'Interface', value: 'Type-C' });
    if (title.toLowerCase().includes('usb')) specs.push({ label: 'Interface', value: 'USB' });
    if (title.toLowerCase().includes('micro')) specs.push({ label: 'Interface', value: 'MicroUSB' });

    if (title.toLowerCase().includes('sd')) specs.push({ label: 'Supported Cards', value: 'SD/MicroSD' });

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Card readers', 0);

        if (await fs.pathExists(SOURCE_DIR)) {
            const files = await fs.readdir(SOURCE_DIR);
            const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

            console.log(`Found ${imageFiles.length} images.`);

            for (const file of imageFiles) {
                const filePath = path.join(SOURCE_DIR, file);
                const imageUrl = await uploadToCloudinary(filePath);
                if (!imageUrl) continue;

                const title = parseFilename(file);
                const sku = `RDR-${Math.floor(Math.random() * 100000)}`;
                const price = 250 + Math.floor(Math.random() * 500);

                const product = new Product({
                    title: title,
                    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                    description: `High speed data transfer with ${title}. Compact and durable design.`,
                    category: rootCat._id,
                    rootCategory: rootCat._id, // Flat category, so root is used
                    basePrice: price,
                    stock: 50,
                    sku: sku,
                    mainImage: imageUrl,
                    images: [imageUrl],
                    hasVariants: false,
                    attributes: {
                        'Brand': 'Walker',
                        'Interface': title.toLowerCase().includes('type-c') ? 'Type-C' : 'USB'
                    },
                    specs: getSpecs(title),
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
