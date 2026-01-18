const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const errorHandler = require('./middleware/error');

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/users', require('./routes/users.routes'));
app.use('/products', require('./routes/products.routes'));
app.use('/orders', require('./routes/orders.routes'));
app.use('/payments', require('./routes/payments.routes'));

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'HustlerShop MZ API - Premium Monochrome Backend',
        version: '1.0.0',
        status: 'Online'
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
