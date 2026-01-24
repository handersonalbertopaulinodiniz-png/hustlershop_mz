const express = require('express');
const router = express.Router();
const { databases, Query, databaseId, ID } = require('../config/appwrite');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// POST /orders (Cliente)
router.post('/', auth, async (req, res) => {
    const { total_amount, shipping_address, payment_method, items } = req.body;
    const user_id = req.user.id;

    try {
        // 1. Create the order
        const order = await databases.createDocument(databaseId, 'orders', ID.unique(), {
            user_id,
            total_amount,
            shipping_address,
            payment_method,
            status: 'pending',
            payment_status: 'pending',
            created_at: new Date().toISOString()
        });

        // 2. Insert order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        await Promise.all(orderItems.map(item =>
            databases.createDocument(databaseId, 'order_items', ID.unique(), item)
        ));

        res.status(201).json({ success: true, message: 'Pedido realizado com sucesso', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /orders (Role-based access)
router.get('/', auth, async (req, res) => {
    const { role, id } = req.user;

    try {
        const queries = [Query.orderDesc('created_at')];

        if (role === 'customer') {
            queries.push(Query.equal('user_id', id));
        } else if (role === 'delivery') {
            queries.push(Query.equal('delivery_id', id));
        }

        const result = await databases.listDocuments(databaseId, 'orders', queries);
        res.json({ success: true, count: result.total, orders: result.documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /orders/:id/assign (Admin only)
router.patch('/:id/assign', auth, admin, async (req, res) => {
    const { id } = req.params;
    const { delivery_id } = req.body;

    try {
        const order = await databases.updateDocument(databaseId, 'orders', id, {
            delivery_id,
            status: 'processing',
            updated_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'Entregador atribuído', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /orders/:id/status (Delivery or Admin)
router.patch('/:id/status', auth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { role, id: userId } = req.user;

    try {
        // 1. Verify ownership/permissions
        const order = await databases.getDocument(databaseId, 'orders', id);

        if (role === 'delivery' && order.delivery_id !== userId) {
            return res.status(403).json({ success: false, message: 'Este pedido não está atribuído a você.' });
        }

        const updated = await databases.updateDocument(databaseId, 'orders', id, {
            status,
            updated_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'Status do pedido atualizado', order: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
