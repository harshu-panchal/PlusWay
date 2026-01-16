const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const adminExists = await Admin.findOne({ email: 'admin@admin.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const adminUser = await Admin.create({
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin123'
        });

        console.log(`Admin User Created: ${adminUser.email}`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
