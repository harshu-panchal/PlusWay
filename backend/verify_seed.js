const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find().sort({ createdAt: -1 }).limit(5).populate('category');
        console.log('Recent Products:');
        products.forEach(p => {
            console.log(`- ${p.title}`);
            console.log(`  Category: ${p.category ? p.category.name : 'None'}`);
            console.log(`  Price: ${p.basePrice}`);
            console.log(`  Image: ${p.mainImage}`);
            console.log('-------------------');
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verify();
