const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const hierarchy = [
    {
        name: 'WALKER',
        icon: 'W',
        children: []
    },
    {
        name: 'Protective glasses',
        icon: '📱',
        filterableAttributes: ['Brand', 'Model Compatibility', 'Material', 'Type', 'Hardness', 'Thickness', 'Edge Curvature'],
        children: [
            {
                name: 'For iPhone',
                children: [
                    '16 Pro Max', '17', '17 Pro', '17 Pro Max', '17 Air',
                    '16 Pro', '16 Plus', '16', '15 Pro Max', '16e',
                    '15 Pro', '15', '14 Pro Max', '14 Pro',
                    '14 Plus', '14', '13 Pro Max', '13 Pro', '13',
                    '13 Mini', '12 Pro Max', '12 / 12 Pro'
                ]
            },
            {
                name: 'Samsung',
                children: [
                    'Galaxy A-series', 'Galaxy F-series', 'Galaxy M-series', 'Galaxy S-series'
                ]
            },
            {
                name: 'Xiaomi',
                children: [
                    'Xiaomi / Xiaomi Mi series', 'Xiaomi Redmi-series',
                    'Xiaomi Redmi Note-series', 'Xiaomi Poco-series'
                ]
            },
            {
                name: 'Oppo',
                children: ['Oppo A-series']
            },
            { name: 'For Apple Watch' },
            {
                name: 'For smartphone camera',
                children: ['iPhone', 'Samsung']
            },
            { name: 'Protective film' }
        ]
    },
    {
        name: 'Cases and straps',
        icon: '🛡️',
        filterableAttributes: ['Brand', 'Model Compatibility', 'Material', 'Color', 'MagSafe', 'Design'],
        children: [
            {
                name: 'For iPhone',
                children: [
                    '17', '17 Pro', '17 Air', '17 Pro Max', '16 Pro Max',
                    '16 Pro', '16 Plus', '16e', '16', '15 Pro Max',
                    '15 Pro', '15', '14 Pro Max', '14 Pro', '14',
                    '13 Pro Max', '13 Pro', '13', '12 Pro Max', '12 Pro',
                    '12', '11 Pro Max', '11 Pro'
                ]
            },
            {
                name: 'Xiaomi',
                children: [
                    'Xiaomi / Xiaomi Mi series', 'Xiaomi Redmi-series',
                    'Xiaomi Redmi Note-series'
                ]
            },
            {
                name: 'Air Pods',
                children: ['AirPods', 'AirPods 3', 'AirPods Pro', 'AirPods Pro 2', 'AirPods 4']
            },
            { name: 'Straps' },
            { name: 'Lanyards' },
            { name: 'Magnetic Ring MagSafe' }
        ]
    },
    {
        name: 'Cables and adapters',
        icon: '🔌',
        filterableAttributes: ['Connector Type', 'Length', 'Power (W)', 'Data Transfer Speed', 'Material', 'Color'],
        children: [
            'Type-C to Type-C', 'Type-C to Lightning', 'USB to Lightning',
            'USB to Type-C', 'USB to Micro', 'USB to Samsung 30-pin',
            'AUX cables', 'HDMI cables', 'USB Hub adapter', 'Adapters (extension cords)'
        ]
    },
    {
        name: 'Charger',
        icon: '⚡',
        filterableAttributes: ['Power (W)', 'Ports', 'Technology (GaN)', 'Type', 'Color'],
        children: [
            'Car chargers', 'Car chargers with cable',
            'Network chargers', 'Network chargers with cable',
            'Wireless chargers'
        ]
    },
    {
        name: 'Headphones',
        icon: '🎧',
        filterableAttributes: ['Type', 'Connectivity', 'ANC (Noise Cancellation)', 'Battery Life', 'Color', 'Brand'],
        children: [
            'Bluetooth headphones', 'Wired headphones', 'Over-the-ear headphones'
        ]
    },
    {
        name: 'Portable speakers',
        icon: '🔊',
        filterableAttributes: ['Power (W)', 'Battery Life', 'Water Resistance', 'Connectivity', 'Color']
    },
    {
        name: 'Portable batteries Power Banks',
        icon: '🔋',
        filterableAttributes: ['Capacity (mAh)', 'Output Power (W)', 'Ports', 'Wireless Charging', 'Brand']
    },
    {
        name: 'Car accessories',
        icon: '🚗',
        children: [
            'Car chargers', 'Car chargers with cable', 'FM Transmitters',
            'Car holders', 'Additional accessories'
        ]
    },
    {
        name: 'Holders and stands',
        icon: '🤳',
        children: [
            'Phone holders', 'Stands for phones, tablets, laptops'
        ]
    },
    {
        name: 'Gadgets',
        icon: '🎮',
        children: [
            'Smart watches', 'Portable Fans', 'Air humidifiers', 'LED lamps',
            'Selfie monopods', 'Microphones', 'Beauty and care',
            'Wireless Gamepad', 'Other gadgets'
        ]
    },
    {
        name: 'Computer accessories',
        icon: '💻',
        children: [
            'Mouse', 'Keyboard', 'Computer headphones', 'Computer Speakers'
        ]
    },
    { name: 'Card readers', icon: '💾' },
    { name: 'Batteries for phones', icon: '🔋' },
    {
        name: 'Kids Accessories',
        icon: '🧸',
        children: [
            'Kids Headphones', 'Kids Smartwatches', "Kids' Microphones",
            'Photo and Video', 'Drawing tablets', 'Toys'
        ]
    },
    { name: 'Best sellers', icon: '🔥' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Category.deleteMany({});
        console.log('Cleared existing categories');

        const insertNode = async (node, parentId = null, level = 0) => {
            // Create slug from name
            const slug = node.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const category = new Category({
                name: node.name,
                slug: slug + '-' + Date.now(), // Ensure uniqueness
                parent: parentId,
                level: level,
                icon: node.icon || null,
                isFeatured: level === 0, // Top level are featured
                filterableAttributes: node.filterableAttributes || [] // Add attributes
            });

            const savedCat = await category.save();
            console.log(`Created: ${'--'.repeat(level)} ${node.name}`);

            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    if (typeof child === 'string') {
                        await insertNode({ name: child }, savedCat._id, level + 1);
                    } else {
                        // Inherit attributes from parent if not specified (optional logic, but keeping explicit for now)
                        // For sub-categories like "For iPhone", we might want specific attributes too.
                        // Let's pass down parent attributes if none exist? No, explicit is better.
                        await insertNode(child, savedCat._id, level + 1);
                    }
                }
            }
        };

        for (const rootCat of hierarchy) {
            await insertNode(rootCat);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedCategories();
