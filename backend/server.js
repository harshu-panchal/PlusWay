const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/appzeto';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:', err);
    });

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('AppZeto Backend API is Running');
});

// Import Routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
