const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find Root: Protective glasses
        const glassesRoot = await Category.findOne({ name: 'Protective glasses', level: 0 });
        if (!glassesRoot) {
            console.error('Root category "Protective glasses" not found. Please run seed_walker_categories.js first.');
            process.exit(1);
        }

        // 2. Find Parent: For iPhone (referencing root)
        const forIphone = await Category.findOne({
            name: 'For iPhone',
            parent: glassesRoot._id
        });
        if (!forIphone) {
            console.error('Category "For iPhone" not found beneath Protective glasses.');
            process.exit(1);
        }

        // 3. Find Children: 16 Pro Max, 17, etc.
        const modelCategories = await Category.find({ parent: forIphone._id });
        console.log(`Found ${modelCategories.length} iPhone model subcategories.`);

        if (modelCategories.length === 0) {
            console.warn('No subcategories found. Seeding products skipped.');
            process.exit(0);
        }

        // 4. Create Products for each model
        const products = [];

        for (const modelCat of modelCategories) {
            const timestamp = Date.now();

            // Product 1: Standard Transparent
            products.push({
                title: `Protective Glass WALKER for Apple ${modelCat.name}`,
                slug: `glass-walker-apple-${modelCat.name.replace(/\s+/g, '-').replace(/\//g, '').toLowerCase()}-${timestamp}-1`,
                description: `High quality protective glass for Apple ${modelCat.name}. Features anti-scratch surface, oleophobic coating, and crystal clear clarity. Easy installation.`,
                category: modelCat._id, // Deepest level
                rootCategory: glassesRoot._id,
                basePrice: 550,
                stock: 100,
                sku: `WLK-GLS-${modelCat.name.replace(/\s+/g, '').replace(/\//g, '').toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                mainImage: 'https://via.placeholder.com/600x800.png?text=Walker+Glass',
                attributes: { 'Brand': 'WALKER', 'Type': 'Transparent' }, // Using Object for Map if Schema supports it transparently, or check Schema
                specs: [{ label: 'Hardness', value: '9H' }, { label: 'Thickness', value: '0.33mm' }],
                status: 'active'
            });

            // Product 2: Privacy
            products.push({
                title: `Protective Glass WALKER Privacy Premium for Apple ${modelCat.name}`,
                slug: `glass-walker-privacy-apple-${modelCat.name.replace(/\s+/g, '-').replace(/\//g, '').toLowerCase()}-${timestamp}-2`,
                description: `Premium Privacy protective glass for Apple ${modelCat.name}. Keep your screen content private from prying eyes. Full coverage protection.`,
                category: modelCat._id,
                rootCategory: glassesRoot._id,
                basePrice: 890,
                stock: 50,
                sku: `WLK-PRV-${modelCat.name.replace(/\s+/g, '').replace(/\//g, '').toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                mainImage: 'https://via.placeholder.com/600x800.png?text=Privacy+Glass',
                attributes: { 'Brand': 'WALKER', 'Type': 'Privacy Premium' },
                specs: [{ label: 'Hardness', value: '9H' }, { label: 'Feature', value: 'Privacy Filter' }],
                status: 'active'
            });

            // Product 3: SuperD
            products.push({
                title: `Protective Glass WALKER SuperD for Apple ${modelCat.name}`,
                slug: `glass-walker-superd-apple-${modelCat.name.replace(/\s+/g, '-').replace(/\//g, '').toLowerCase()}-${timestamp}-3`,
                description: `SuperD full cover protective glass for Apple ${modelCat.name}. Edge-to-edge protection with high impact resistance.`,
                category: modelCat._id,
                rootCategory: glassesRoot._id,
                basePrice: 950,
                stock: 75,
                sku: `WLK-SD-${modelCat.name.replace(/\s+/g, '').replace(/\//g, '').toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                mainImage: 'https://via.placeholder.com/600x800.png?text=SuperD+Glass',
                attributes: { 'Brand': 'WALKER', 'Type': 'SuperD' },
                specs: [{ label: 'Hardness', value: '9H' }, { label: 'Coverage', value: 'Full Screen' }],
                status: 'active'
            });
        }

        // 5. Insert
        console.log(`Preparing to insert ${products.length} products...`);
        // Using insertMany options including ordered: false to continue if some duplicate keys error (unlikely with timestamps)
        await Product.insertMany(products, { ordered: false });
        console.log(`Successfully seeded ${products.length} products to DB.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
