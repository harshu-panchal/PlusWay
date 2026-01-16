const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');
require('dotenv').config();

const checkDeliveryBoys = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const count = await DeliveryBoy.countDocuments();
        console.log(`Total Delivery Boys: ${count}`);

        if (count > 0) {
            const boys = await DeliveryBoy.find({});
            console.log('Sample Data:', JSON.stringify(boys[0], null, 2));
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDeliveryBoys();
