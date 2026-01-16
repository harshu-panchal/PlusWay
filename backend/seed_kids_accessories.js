const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Kids Accessories');
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
            filterableAttributes: ['Age Group', 'Color', 'Material']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('kids-accessories_', '')
        .replace('kids-headphones_', '')
        .replace('kids-smartwatches_', '')
        .replace('kids-microphones_', '')
        .replace('drawing-tablets_', '')
        .replace('photo-and-video_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getSpecs = (subcatName, title) => {
    const specs = [
        { label: 'Category', value: subcatName },
        { label: 'Age Group', value: '3+ Years' },
        { label: 'Safety', value: 'Child Safe Material' }
    ];

    const lowerSub = subcatName.toLowerCase();

    if (lowerSub.includes('headphone')) {
        specs.push({ label: 'Volume Limit', value: '85dB (Safe for Kids)' });
        specs.push({ label: 'Cushion', value: 'Soft Protein Leather' });
        specs.push({ label: 'Connectivity', value: 'Wired / Bluetooth' });
    } else if (lowerSub.includes('watch')) {
        specs.push({ label: 'Features', value: 'GPS, SOS, Games' });
        specs.push({ label: 'Battery', value: '400mAh' });
        specs.push({ label: 'Screen', value: 'Touch Screen' });
    } else if (lowerSub.includes('tablet')) {
        specs.push({ label: 'Screen Type', value: 'LCD Writing Board' });
        specs.push({ label: 'Battery', value: 'Replaceable Coin Cell' });
        specs.push({ label: 'Feature', value: 'Eye Protection' });
    } else if (lowerSub.includes('microphone')) {
        specs.push({ label: 'Feature', value: 'Voice Changer, Echo Effect' });
        specs.push({ label: 'Connectivity', value: 'Bluetooth' });
    } else if (lowerSub.includes('photo')) {
        specs.push({ label: 'Resolution', value: '1080p Video / 12MP Photo' });
        specs.push({ label: 'Storage', value: 'SD Card Support' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Kids Accessories', 0);

        if (await fs.pathExists(SOURCE_DIR)) {
            const subDirs = await fs.readdir(SOURCE_DIR);

            for (const dir of subDirs) {
                const fullPath = path.join(SOURCE_DIR, dir);
                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    console.log(`Processing Subfolder: ${dir}`);

                    const subCat = await ensureCategory(dir, 1, rootCat._id);
                    const files = await fs.readdir(fullPath);
                    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

                    for (const file of imageFiles) {
                        const filePath = path.join(fullPath, file);
                        const imageUrl = await uploadToCloudinary(filePath);
                        if (!imageUrl) continue;

                        const title = parseFilename(file);
                        const sku = `KID-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        let price = 599;
                        if (dir.includes('Smartwatches')) price = 1499 + Math.floor(Math.random() * 1000);
                        if (dir.includes('Headphones')) price = 899 + Math.floor(Math.random() * 500);
                        if (dir.includes('Photo')) price = 1299 + Math.floor(Math.random() * 1000);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Fun and safe ${title} for kids. Durable design and child-friendly features.`,
                            category: subCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 50,
                            sku: sku,
                            mainImage: imageUrl,
                            images: [imageUrl],
                            hasVariants: false,
                            attributes: {
                                'Brand': 'Walker Kids',
                                'Type': dir
                            },
                            specs: getSpecs(dir, title),
                            status: 'active'
                        });

                        await product.save();
                        console.log(`Inserted: ${title}`);
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
