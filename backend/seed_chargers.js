const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

// NOTE: The folder name 'Сharger' might contain a Cyrillic 'C'.
// We use the exact string from directory listing.
const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Сharger');
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
    // Escape special chars for regex
    let safeName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let query = { name: new RegExp('^' + safeName + '$', 'i'), level };
    if (parentIdx) query.parent = parentIdx;

    let cat = await Category.findOne(query);
    if (!cat) {
        console.log(`Creating category: ${name} (L${level})`);
        cat = await Category.create({
            name: name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
            level,
            parent: parentIdx,
            filterableAttributes: ['Output Power', 'Port Type', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('car-chargers_', '')
        .replace('network-chargers_', '')
        .replace('wireless-chargers_', '')
        .replace('сharger_', '') // Try both Cyrillic and Latin
        .replace('charger_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const extractSpecs = (title, subcatName) => {
    const specs = [
        { label: 'Category', value: subcatName }
    ];

    // Wattage
    const wattMatch = title.match(/(\d+)w/i);
    if (wattMatch) {
        specs.push({ label: 'Output Power', value: `${wattMatch[1]}W` });
        specs.push({ label: 'Fast Charging', value: 'Yes' });
    } else {
        specs.push({ label: 'Output Power', value: '18W Standard' });
    }

    // Ports
    if (title.toLowerCase().includes('type-c') || title.toLowerCase().includes('pd')) {
        specs.push({ label: 'Port Type', value: 'USB-C (PD)' });
    } else if (title.toLowerCase().includes('usb')) {
        specs.push({ label: 'Port Type', value: 'USB-A' });
    } else if (title.toLowerCase().includes('wireless')) {
        specs.push({ label: 'Type', value: 'Wireless Qi' });
    }

    // Amperage
    const ampMatch = title.match(/(\d+(\.\d+)?)a/i);
    if (ampMatch) {
        specs.push({ label: 'Output Current', value: `${ampMatch[1]}A` });
    }

    // Technology
    if (title.toLowerCase().includes('gan')) {
        specs.push({ label: 'Technology', value: 'GaN (Gallium Nitride)' });
    }

    // Cable
    if (subcatName.toLowerCase().includes('with cable')) {
        specs.push({ label: 'Included', value: 'Charging Cable' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Note: Using standard English 'Chargers' for DB category name to be clean, 
        // even if folder is Cyrillic.
        const rootCat = await ensureCategory('Chargers', 0);

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
                        const specs = extractSpecs(title, dir);

                        let price = 499;
                        if (dir.includes('Car')) price = 399;
                        if (dir.includes('Wireless')) price = 1299;
                        if (specs.some(s => s.label === 'Output Power' && parseInt(s.value) > 20)) price += 500;
                        if (dir.includes('with cable')) price += 200;

                        price += Math.floor(Math.random() * 200);

                        const sku = `CHG-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Fast and safe charging with ${title}. reliable technology.`,
                            category: subCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 150,
                            sku: sku,
                            mainImage: imageUrl,
                            images: [imageUrl],
                            hasVariants: false,
                            attributes: {
                                'Brand': 'Walker',
                                'Type': dir
                            },
                            specs: specs,
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
