const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});

// Setup Security Middleware
const setupSecurity = (app) => {
    // Set security HTTP headers
    app.use(helmet());

    // Data Sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data Sanitization against XSS
    app.use(xss());

    // Apply Rate Limiting to all requests
    app.use('/api', limiter);
};

module.exports = setupSecurity;
