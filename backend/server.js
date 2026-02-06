const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Trust proxy - Required for Render and other reverse proxies
// This allows Express to trust the X-Forwarded-* headers
app.set('trust proxy', 1);

// Security Middleware (Rate Limit, Helmet, Sanitize, XSS)
const setupSecurity = require('./middleware/security');
setupSecurity(app);

// Standard Middleware
// CORS Configuration - Allow both local development and production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null
].filter(Boolean); // Remove undefined values

console.log('🔒 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins);
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(compression()); // Compress all responses
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for larger data syncs
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/appzeto';

mongoose.connect(MONGO_URI, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => {
        console.log('✅ MongoDB Connected with optimized pool');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:');
        console.error('   Error Name:', err.name);
        console.error('   Error Message:', err.message);
        console.error('   Check if your IP is whitelisted in MongoDB Atlas or if your network blocks MongoDB connections.');
    });

// Health Check Endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root Route
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
app.use('/api/paypal', require('./routes/paypalRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/translate', require('./routes/translationRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful Shutdown
const gracefulShutdown = async () => {
    console.log('\n🛑 Received shutdown signal, closing server gracefully...');
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
