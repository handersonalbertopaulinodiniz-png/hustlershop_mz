const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security

// CORS Configuration - restrict in production
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/auth/login', authLimiter);
app.use('/auth/signup', authLimiter);

// Body Parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const errorHandler = require('./middleware/error');

// Routes with /api prefix for better organization
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/payments', require('./routes/payments.routes'));

// Health check (minimal information exposure)
app.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'Online',
        timestamp: new Date().toISOString()
    });
});

// Detailed health check for monitoring (should be protected in production)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'HustlerShop MZ API',
        version: '1.0.0',
        status: 'Online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
