const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('--- Categories matching /Charger/i ---');
        const cats = await Category.find({ name: /Charger/i });

        cats.forEach(c => {
            console.log(`Name: "${c.name}", Slug: "${c.slug}", ID: ${c._id}, Parent: ${c.parent}`);
        });

        if (cats.length === 0) {
            console.log('No categories found matching /Charger/i');
        }

        console.log('\n--- Checking for Cyrillic Сharger ---');
        const cyrillic = await Category.find({ name: /Сharger/i }); // Cyrillic C
        cyrillic.forEach(c => {
            console.log(`[Cyrillic] Name: "${c.name}", Slug: "${c.slug}"`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
