const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const SOURCE_DIR = path.resolve(__dirname, '../scraper_tool/product images/protective glasses');
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
            filterableAttributes: ['Type', 'Model Compatibility', 'Hardness']
        });
    }
    return cat;
}

const parseFilename = (filename, subcatName) => {
    const namePart = path.basename(filename, path.extname(filename));
    let clean = namePart
        .replace(subcatName.toLowerCase().replace(/\s+/g, '-') + '_', '')
        .replace('protective-glasses_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const extractModel = (title, subcatName) => {
    if (subcatName.toLowerCase().includes('iphone')) {
        const match = title.match(/iPhone\s(\d+(\s(Pro|Max|Plus|Air|e|Mini))*)?/i);
        if (match) {
            const parts = match[0].split('iPhone ');
            if (parts.length > 1 && parts[1].trim()) return parts[1].trim();
        }
    }
    if (subcatName.toLowerCase().includes('samsung')) {
        const match = title.match(/Galaxy\s(\w+)/i);
        if (match) return match[0];
    }
    if (subcatName.toLowerCase().includes('watch')) {
        const match = title.match(/Watch\s(\d+)/i);
        if (match) return match[0];
    }
    return null;
};

const getSpecs = (title, subcatName) => {
    const specs = [
        { label: 'Type', value: 'Tempered Glass' }
    ];

    if (subcatName.toLowerCase().includes('film')) {
        specs[0].value = 'Protective Film';
        specs.push({ label: 'Material', value: 'Hydrogel / PET' });
    } else {
        specs.push({ label: 'Hardness', value: '9H' });
        specs.push({ label: 'Thickness', value: '0.33mm' });
    }

    if (title.toLowerCase().includes('privacy')) {
        specs.push({ label: 'Feature', value: 'Anti-Spy / Privacy' });
    } else if (title.toLowerCase().includes('matte')) {
        specs.push({ label: 'Finish', value: 'Matte (Anti-Glare)' });
    } else {
        specs.push({ label: 'Finish', value: 'HD Clear' });
    }

    if (title.toLowerCase().includes('3d') || title.toLowerCase().includes('curved')) {
        specs.push({ label: 'Edge', value: '3D Curved' });
    } else {
        specs.push({ label: 'Edge', value: '2.5D Arc' });
    }

    if (title.toLowerCase().includes('camera')) {
        specs.push({ label: 'Type', value: 'Camera Lens Protector' });
    }

    return specs;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const rootCat = await ensureCategory('Protective glasses', 0);

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

                        const title = parseFilename(file, dir);

                        // Infer Level 2 Model
                        const model = extractModel(title, dir);
                        let finalCat = subCat;

                        if (model) {
                            finalCat = await ensureCategory(model, 2, subCat._id);
                        }

                        const sku = `GLS-${finalCat.slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 100000)}`;
                        let price = 199;
                        if (title.toLowerCase().includes('privacy')) price = 399;
                        if (dir.toLowerCase().includes('camera')) price = 249;
                        if (dir.toLowerCase().includes('watch')) price = 299;

                        price += Math.floor(Math.random() * 100);

                        const product = new Product({
                            title: title,
                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                            description: `Premium protection with ${title}. High durability and clarity.`,
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
                            specs: getSpecs(title, dir),
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
