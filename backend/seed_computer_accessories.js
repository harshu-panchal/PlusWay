const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Computer accessories');
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
        .replace('computer-accessories_', '')
        .replace('computer-speakers_', '')
        .replace('computer-headphones_', '')
        .replace('keyboard_', '')
        .replace('mouse_', '')
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

    if (lowerSub.includes('mouse')) {
        specs.push({ label: 'DPI', value: '1000-1600 Adjustable' });
        specs.push({ label: 'Sensory', value: 'Optical' });
        specs.push({ label: 'Buttons', value: '3-6' });
        specs.push({ label: 'Connectivity', value: lowerTitle.includes('wireless') ? '2.4GHz Wireless' : 'Wired USB' });
    } else if (lowerSub.includes('keyboard')) {
        specs.push({ label: 'Keys', value: '104 Standard' });
        specs.push({ label: 'Type', value: 'Membrane' });
        specs.push({ label: 'Language', value: 'English (US)' });
        if (lowerTitle.includes('game')) specs.push({ label: 'Backlight', value: 'RGB' });
    } else if (lowerSub.includes('speaker')) {
        specs.push({ label: 'Channels', value: '2.0 Stereo' });
        specs.push({ label: 'Power', value: '3W x 2' });
        specs.push({ label: 'Interface', value: '3.5mm Jack + USB Power' });
    } else if (lowerSub.includes('headphone')) {
        specs.push({ label: 'Driver', value: '40mm' });
        specs.push({ label: 'Microphone', value: 'Yes, Adjustable' });
        specs.push({ label: 'Connector', value: '3.5mm x 2 / USB' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Computer accessories', 0);

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
                        const sku = `COMP-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        let price = 499; // Default
                        if (dir.includes('Mouse')) price = 299 + Math.floor(Math.random() * 500);
                        if (dir.includes('Keyboard')) price = 599 + Math.floor(Math.random() * 800);
                        if (dir.includes('Headphones')) price = 799 + Math.floor(Math.random() * 1000);
                        if (dir.includes('Speakers')) price = 699 + Math.floor(Math.random() * 1000);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Enhance your workspace with this ${title}. Perfect for home or office use.`,
                            category: subCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 60,
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
