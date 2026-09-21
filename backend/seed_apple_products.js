// Seeds 2 genuine Apple products each into Chargers, Computer accessories and Gadgets.
//
// Usage: node seed_apple_products.js
//
// Images: put a photo named <sku>.jpg/.png/.webp in backend/seed_images/apple/ (e.g. APPLE-AIRTAG-1PK.jpg)
// and it is uploaded to Cloudinary. Without a file, a placeholder image is used - replace it from
// Admin > Products. Prices are approximate INR MRPs; adjust them in the admin panel.
//
// Safe to re-run: products are matched by SKU and skipped if they already exist.
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const IMAGE_DIR = path.resolve(__dirname, 'seed_images/apple');
const CLOUDINARY_FOLDER = 'plusway_products';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PRODUCTS = [
    // ---- Chargers ----
    {
        root: 'Chargers', sub: 'Network chargers',
        sku: 'APPLE-20W-USBC-ADAPTER',
        title: 'Apple 20W USB-C Power Adapter',
        description: 'Original Apple 20W USB-C Power Adapter for fast, efficient charging at home, in the office or on the go. Charges iPhone and iPad quickly when used with a USB-C cable.',
        basePrice: 1900, stock: 40,
        attributes: { Brand: 'Apple', Type: 'Network charger' },
        specs: [
            { label: 'Output Power', value: '20W' },
            { label: 'Port', value: 'USB-C' },
            { label: 'Compatibility', value: 'iPhone, iPad, AirPods' },
            { label: 'Cable', value: 'Sold separately' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    },
    {
        root: 'Chargers', sub: 'Wireless chargers',
        sku: 'APPLE-MAGSAFE-CHARGER-1M',
        title: 'Apple MagSafe Charger (1 m)',
        description: 'Original Apple MagSafe Charger. Magnets align perfectly with your iPhone for faster wireless charging up to 15W. USB-C cable, 1 metre.',
        basePrice: 4500, stock: 30,
        attributes: { Brand: 'Apple', Type: 'Wireless charger' },
        specs: [
            { label: 'Charging', value: 'Up to 15W wireless (MagSafe)' },
            { label: 'Cable Length', value: '1 m' },
            { label: 'Connector', value: 'USB-C' },
            { label: 'Compatibility', value: 'iPhone 12 and later, AirPods with wireless charging case' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    },
    // ---- Computer accessories ----
    {
        root: 'Computer accessories', sub: 'Mouse',
        sku: 'APPLE-MAGIC-MOUSE-USBC',
        title: 'Apple Magic Mouse (USB-C)',
        description: 'Original Apple Magic Mouse with a Multi-Touch surface for scrolling and swiping. Rechargeable battery, pairs automatically with your Mac.',
        basePrice: 9500, stock: 20,
        attributes: { Brand: 'Apple', Type: 'Wireless mouse' },
        specs: [
            { label: 'Connectivity', value: 'Bluetooth' },
            { label: 'Charging Port', value: 'USB-C' },
            { label: 'Surface', value: 'Multi-Touch' },
            { label: 'Compatibility', value: 'Mac, iPad' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    },
    {
        root: 'Computer accessories', sub: 'Keyboard',
        sku: 'APPLE-MAGIC-KEYBOARD-USBC',
        title: 'Apple Magic Keyboard (USB-C)',
        description: 'Original Apple Magic Keyboard with a comfortable, precise typing experience. Wireless and rechargeable, with a USB-C to USB-C charging cable included.',
        basePrice: 10500, stock: 20,
        attributes: { Brand: 'Apple', Type: 'Wireless keyboard' },
        specs: [
            { label: 'Connectivity', value: 'Bluetooth' },
            { label: 'Charging Port', value: 'USB-C' },
            { label: 'Layout', value: 'English' },
            { label: 'Compatibility', value: 'Mac, iPad, iPhone' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    },
    // ---- Gadgets ----
    {
        root: 'Gadgets', sub: 'Other gadgets',
        sku: 'APPLE-AIRTAG-1PK',
        title: 'Apple AirTag (1 Pack)',
        description: 'Original Apple AirTag. Attach it to keys, a bag or luggage and keep track of them in the Find My app. Replaceable battery, water and dust resistant.',
        basePrice: 3190, stock: 50,
        attributes: { Brand: 'Apple', Type: 'Item tracker' },
        specs: [
            { label: 'Pack', value: '1 AirTag' },
            { label: 'Tracking', value: 'Find My network, Precision Finding' },
            { label: 'Battery', value: 'User-replaceable CR2032' },
            { label: 'Water Resistance', value: 'IP67' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    },
    {
        root: 'Gadgets', sub: 'Smart watches',
        sku: 'APPLE-WATCH-SE-GPS-40',
        title: 'Apple Watch SE (GPS) 40mm',
        description: 'Original Apple Watch SE with GPS. Tracks workouts, sleep and heart rate, and keeps you connected with notifications and calls from your wrist.',
        basePrice: 24900, stock: 10,
        attributes: { Brand: 'Apple', Type: 'Smart watch' },
        specs: [
            { label: 'Case Size', value: '40 mm' },
            { label: 'Connectivity', value: 'GPS' },
            { label: 'Compatibility', value: 'iPhone' },
            { label: 'Health', value: 'Heart rate, sleep tracking' },
            { label: 'Authenticity', value: 'Original Apple' }
        ]
    }
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findCategory(name, level, parent) {
    const query = { name: new RegExp(`^${escapeRegex(name)}$`, 'i'), level };
    if (parent) query.parent = parent;
    const cat = await Category.findOne(query);
    if (!cat) throw new Error(`Category not found: ${name} (level ${level})`);
    return cat;
}

async function resolveImage(item) {
    const files = (await fs.pathExists(IMAGE_DIR)) ? await fs.readdir(IMAGE_DIR) : [];
    const file = files.find((f) => path.parse(f).name.toLowerCase() === item.sku.toLowerCase());
    if (file) {
        try {
            const result = await cloudinary.uploader.upload(path.join(IMAGE_DIR, file), {
                folder: CLOUDINARY_FOLDER,
                public_id: item.sku.toLowerCase(),
                overwrite: true
            });
            return result.secure_url;
        } catch (err) {
            console.error(`Cloudinary upload failed for ${item.sku}: ${err.message}`);
        }
    }
    console.log(`  (no image for ${item.sku} - using placeholder, replace it in the admin panel)`);
    return `https://placehold.co/800x800/png?text=${encodeURIComponent(item.title)}`;
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const item of PRODUCTS) {
        if (await Product.exists({ sku: item.sku })) {
            console.log(`Skipping (already exists): ${item.title}`);
            continue;
        }

        const root = await findCategory(item.root, 0);
        const sub = await findCategory(item.sub, 1, root._id);
        const image = await resolveImage(item);

        await Product.create({
            title: item.title,
            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
            description: item.description,
            category: sub._id,
            rootCategory: root._id,
            basePrice: item.basePrice,
            stock: item.stock,
            sku: item.sku,
            mainImage: image,
            images: [image],
            hasVariants: false,
            attributes: item.attributes,
            specs: item.specs,
            status: 'active'
        });
        console.log(`Inserted: ${item.title}  ->  ${item.root} / ${item.sub}`);
    }

    console.log('Seeding complete');
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
