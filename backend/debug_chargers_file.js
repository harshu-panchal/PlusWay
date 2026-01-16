const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Category = require('./models/Category');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let output = '--- Categories matching /Charger/i ---\n';
        const cats = await Category.find({ name: /Charger/i });

        cats.forEach(c => {
            output += `Name: "${c.name}", Slug: "${c.slug}", ID: ${c._id}, Parent: ${c.parent}\n`;
        });

        if (cats.length === 0) {
            output += 'No categories found matching /Charger/i\n';
        }

        output += '\n--- Checking for Cyrillic Сharger ---\n';
        const cyrillic = await Category.find({ name: /Сharger/i });
        cyrillic.forEach(c => {
            output += `[Cyrillic] Name: "${c.name}", Slug: "${c.slug}"\n`;
        });

        fs.writeFileSync('debug_output.txt', output);
        console.log('Done writing to debug_output.txt');

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
