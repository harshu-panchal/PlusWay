const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️ Cleared existing categories');

        const categories = [
            {
                name: 'Protective glasses',
                slug: 'protective-glasses',
                children: [
                    {
                        name: 'For iPhone',
                        slug: 'glasses-iphone',
                        children: [
                            '15 Pro Max', '15 Pro', '15', '14 Pro Max', '14 Pro', '13', '12'
                        ]
                    },
                    {
                        name: 'Samsung',
                        slug: 'glasses-samsung',
                        children: ['Galaxy S24', 'Galaxy S23', 'Galaxy A54']
                    },
                    {
                        name: 'Xiaomi',
                        slug: 'glasses-xiaomi',
                        children: ['Redmi Note 13', 'Poco X6']
                    }
                ]
            },
            {
                name: 'Cases and straps',
                slug: 'cases',
                children: [
                    { name: 'Silicon Case', slug: 'case-silicon' },
                    { name: 'Leather Case', slug: 'case-leather' }
                ]
            },
            {
                name: 'Cables and adapters',
                slug: 'cables',
                children: [
                    { name: 'USB-C', slug: 'cable-usbc' },
                    { name: 'Lightning', slug: 'cable-lightning' }
                ]
            },
            {
                name: 'Chargers',
                slug: 'chargers',
                children: [
                    { name: 'Wireless', slug: 'charger-wireless' },
                    { name: 'Wall Adapter', slug: 'charger-wall' }
                ]
            }
        ];

        for (const cat of categories) {
            // 1. Create Root Category
            const root = await Category.create({
                name: cat.name,
                slug: cat.slug,
                level: 0
            });
            console.log(`Created Root: ${root.name}`);

            if (cat.children) {
                for (const child of cat.children) {
                    let childName = typeof child === 'string' ? child : child.name;
                    let childSlug = typeof child === 'string' ? child.toLowerCase().replace(/ /g, '-') : child.slug;

                    // 2. Create Level 1 (Brand/Type)
                    const level1 = await Category.create({
                        name: childName,
                        slug: childSlug,
                        parent: root._id,
                        level: 1
                    });
                    console.log(`  └─ Created L1: ${level1.name}`);

                    // 3. Create Level 2 (Models) - Only if defined in structure above
                    if (typeof child !== 'string' && child.children) {
                        for (const model of child.children) {
                            await Category.create({
                                name: model,
                                slug: `${childSlug}-${model.toLowerCase().replace(/ /g, '-')}`,
                                parent: level1._id,
                                level: 2
                            });
                            console.log(`     └─ Created L2: ${model}`);
                        }
                    }
                }
            }
        }

        console.log('✅ Seeding Completed Successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedCategories();
