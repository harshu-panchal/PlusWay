const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const IMAGES_DIR = path.resolve(__dirname, '../scraper_tool/product images/Cables and adapters/Adapters (extension cords)');
const CLOUDINARY_FOLDER = 'plusway_products';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const parseFilename = (filename) => {
    // adapters-extension-cords_adapter-hdmi-to-hdmi-angle-black.jpg
    const namePart = path.basename(filename, path.extname(filename));
    const cleanName = namePart
        .replace('adapters-extension-cords_', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

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

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const catName = 'Adapters (extension cords)';
        let category = await Category.findOne({ name: catName });

        if (!category) {
            console.log('Category not found, fetching valid parent...');
            // Need parent "Cables and adapters"
            const parent = await Category.findOne({ name: 'Cables and adapters' });
            category = await Category.create({
                name: catName,
                slug: 'adapters-extension-cords-' + Date.now(),
                level: 1,
                parent: parent ? parent._id : null
            });
        }

        // Clean up old "bad" seeds if any (optional, but good for "re-run")
        const deleted = await Product.deleteMany({ category: category._id });
        console.log(`Cleared ${deleted.deletedCount} existing products in ${catName}`);

        const files = await fs.readdir(IMAGES_DIR);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

        for (const file of imageFiles) {
            const filePath = path.join(IMAGES_DIR, file);
            const imageUrl = await uploadToCloudinary(filePath);
            if (!imageUrl) continue;

            const title = parseFilename(file);
            const sku = `ADP-${Math.floor(Math.random() * 100000)}`;
            const price = 150 + Math.floor(Math.random() * 500);

            const product = new Product({
                title: title,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                description: `High quality ${title}. Practical solution for your connectivity needs.`,
                category: category._id,
                rootCategory: category.parent,
                basePrice: price,
                stock: 80,
                sku: sku,
                mainImage: imageUrl,
                images: [imageUrl],
                hasVariants: false,
                attributes: {
                    'Type': 'Adapter',
                    'Brand': 'Walker/XO'
                },
                specs: [
                    { label: 'Type', value: 'Adapter' },
                    { label: 'Application', value: 'Audio/Video/Data' }
                ],
                status: 'active'
            });

            await product.save();
            console.log(`Inserted: ${title}`);
        }

        console.log('Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
