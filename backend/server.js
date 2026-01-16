const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Security Middleware (Rate Limit, Helmet, Sanitize, XSS)
const setupSecurity = require('./middleware/security');
setupSecurity(app);

// Standard Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
    res.send('PlusWay Backend API is Running');
});

// Import Routes
// Import Routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const financialRoutes = require('./routes/financialRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/addresses', addressRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/finance', financialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/deals', require('./routes/dealRoutes'));
