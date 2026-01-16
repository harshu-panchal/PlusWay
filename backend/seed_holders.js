const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/Holders and stands');
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
            filterableAttributes: ['Material', 'Mount Type', 'Color']
        });
    }
    return cat;
}

const parseFilename = (filename) => {
    const namePart = path.basename(filename, path.extname(filename));
    let cleanName = namePart
        .replace('holders-and-stands_', '')
        .replace('phone-holders_', '')
        .replace('stands-for-phones-tablets-laptops_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getSpecs = (subcatName, title) => {
    const specs = [
        { label: 'Category', value: subcatName }
    ];

    const lowerSub = subcatName.toLowerCase();
    const lowerTitle = title.toLowerCase();

    if (lowerSub.includes('stands')) {
        specs.push({ label: 'Material', value: 'Aluminum Alloy / ABS' });
        specs.push({ label: 'Compatibility', value: 'Phones & Tablets (4-13 inch)' });
        if (lowerTitle.includes('adjustable')) {
            specs.push({ label: 'Feature', value: 'Adjustable Angle/Height' });
        }
        specs.push({ label: 'Base', value: 'Anti-slip Silicone' });
    } else {
        specs.push({ label: 'Type', value: 'Phone Holder' });
        if (lowerTitle.includes('magnetic')) {
            specs.push({ label: 'Mount', value: 'Magnetic' });
        } else if (lowerTitle.includes('ring')) {
            specs.push({ label: 'Type', value: 'Ring Holder' });
        } else {
            specs.push({ label: 'Mount', value: 'Clamp / Stand' });
        }
        specs.push({ label: 'Material', value: 'Durable Plastic' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Holders and stands', 0);

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
                        const sku = `HLD-${subCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;

                        let price = 299;
                        if (dir.includes('Stands')) price = 699 + Math.floor(Math.random() * 1000);
                        if (dir.includes('Phone holders')) price = 199 + Math.floor(Math.random() * 500);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Secure and stable ${title}. Ideal for hands-free usage.`,
                            category: subCat._id,
                            rootCategory: rootCat._id,
                            basePrice: price,
                            stock: 100,
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
