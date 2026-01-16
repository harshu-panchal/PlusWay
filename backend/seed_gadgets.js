const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Gadgets');
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
            filterableAttributes: ['Type', 'Connectivity', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('gadgets_', '')
        .replace('smart-watches_', '')
        .replace('portable-fans_', '')
        .replace('led-lamps_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getSpecs = (subcatName, title) => {
    const specs = [
        { label: 'Category', value: subcatName }
    ];

    const lowerTitle = title.toLowerCase();
    const lowerSub = subcatName.toLowerCase();

    if (lowerSub.includes('watch')) {
        specs.push({ label: 'Battery', value: '2-5 Days' });
        specs.push({ label: 'Screen', value: 'Touch AMOLED/LCD' });
        specs.push({ label: 'Connectivity', value: 'Bluetooth 5.0' });
        specs.push({ label: 'Features', value: 'Heart Rate, Steps, Notifications' });
    } else if (lowerSub.includes('fan')) {
        specs.push({ label: 'Battery', value: '1200mAh - 2000mAh' });
        specs.push({ label: 'Speed', value: '3 Speed Levels' });
        specs.push({ label: 'Charging', value: 'USB Type-C' });
    } else if (lowerSub.includes('lamp')) {
        specs.push({ label: 'Light Type', value: 'LED' });
        specs.push({ label: 'Power', value: '5W - 10W' });
        specs.push({ label: 'Modes', value: 'Warm / Cool / Daylight' });
    } else if (lowerSub.includes('humidifier')) {
        specs.push({ label: 'Capacity', value: '300ml - 500ml' });
        specs.push({ label: 'Power', value: 'USB Powered' });
        specs.push({ label: 'Feature', value: 'LED Night Light' });
    } else if (lowerSub.includes('gamepad')) {
        specs.push({ label: 'Connectivity', value: 'Wireless Bluetooth' });
        specs.push({ label: 'Battery', value: '400mAh' });
        specs.push({ label: 'Compatibility', value: 'iOS / Android / PC' });
    } else if (lowerSub.includes('microphone')) {
        specs.push({ label: 'Type', value: 'Condenser / Lavalier' });
        specs.push({ label: 'Connectivity', value: 'Wireless / Aux / USB' });
        if (lowerTitle.includes('wireless')) specs.push({ label: 'Range', value: '20m' });
    } else if (lowerSub.includes('selfie')) {
        specs.push({ label: 'Length', value: 'Extendable to 70-100cm' });
        specs.push({ label: 'Remote', value: 'Bluetooth Remote Included' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Gadgets', 0);

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
                        const sku = `GAD-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        let price = 999;
                        if (dir.includes('Smart watches')) price = 1499 + Math.floor(Math.random() * 2000);
                        if (dir.includes('Fan') || dir.includes('Lamp')) price = 499 + Math.floor(Math.random() * 500);
                        if (dir.includes('Gamepad')) price = 899 + Math.floor(Math.random() * 800);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Innovative ${title}. A perfect addition to your tech collection.`,
                            category: subCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 40,
                            sku: sku,
                            mainImage: imageUrl,
                            images: [imageUrl],
                            hasVariants: false,
                            attributes: {
                                'Brand': 'Walker',
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
