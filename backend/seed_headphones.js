const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Headphones');
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
            filterableAttributes: ['Type', 'Connectivity', 'Brand', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('headphones_', '')
        .replace('bluetooth-headphones_', '')
        .replace('wired-headphones_', '')
        .replace('over-the-ear-headphones_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getSpecs = (subcatName, title) => {
    const specs = [
        { label: 'Category', value: subcatName }
    ];

    const lowerSub = subcatName.toLowerCase();

    if (lowerSub.includes('bluetooth')) {
        specs.push({ label: 'Connectivity', value: 'Bluetooth 5.0' });
        specs.push({ label: 'Battery Life', value: '15-20 Hours' });
        specs.push({ label: 'Charging Time', value: '1.5 Hours' });
        specs.push({ label: 'Range', value: '10m' });
    } else if (lowerSub.includes('wired')) {
        specs.push({ label: 'Connectivity', value: 'Wired 3.5mm' });
        specs.push({ label: 'Cable Length', value: '1.2m' });
        specs.push({ label: 'Driver', value: '10mm Dynamic' });
    } else if (lowerSub.includes('over-the-ear')) {
        specs.push({ label: 'Type', value: 'Over-Ear' });
        specs.push({ label: 'Driver Unit', value: '40mm' });
        specs.push({ label: 'Cushion', value: 'Memory Foam' });
        if (title.toLowerCase().includes('wireless')) {
            specs.push({ label: 'Connectivity', value: 'Wireless + Wired' });
            specs.push({ label: 'Battery', value: '30 Hours' });
        } else {
            specs.push({ label: 'Connectivity', value: 'Wired' });
        }
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Headphones', 0);

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
                        const sku = `AUD-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        let price = 999;
                        if (dir.includes('Bluetooth')) price = 1299 + Math.floor(Math.random() * 1500);
                        if (dir.includes('Over-the-ear')) price = 1999 + Math.floor(Math.random() * 2000);
                        if (dir.includes('Wired')) price = 399 + Math.floor(Math.random() * 500);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Immersive audio experience with ${title}. Deep bass and crystal clear treble.`,
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
