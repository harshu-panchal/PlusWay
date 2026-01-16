const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Delete Categories
        const cats = await Category.find({ name: { $in: [/Charger/i, /Chargers/i] } });
        console.log(`Found ${cats.length} Charger categories to delete.`);

        const catIds = cats.map(c => c._id);
        await Category.deleteMany({ _id: { $in: catIds } });
        console.log('Deleted categories.');

        // Delete Products
        const products = await Product.find({
            $or: [
                { category: { $in: catIds } },
                { rootCategory: { $in: catIds } },
                { title: /Charger/i }
            ]
        });
        console.log(`Found ${products.length} Charger products to delete.`);
        await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });
        console.log('Deleted products.');

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
