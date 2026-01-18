const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// POST /orders (Cliente)
router.post('/', auth, async (req, res) => {
    const { total_amount, shipping_address, payment_method, items } = req.body;
    const customer_id = req.user.id;

    try {
        // 1. Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{ customer_id, total_amount, shipping_address, payment_method }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insert order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        res.status(201).json({ success: true, message: 'Pedido realizado com sucesso', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /orders (Role-based access)
router.get('/', auth, async (req, res) => {
    const { role, id } = req.user;

    try {
        let query = supabase.from('orders').select('*, profiles!orders_customer_id_fkey(full_name), order_items(*)');

        if (role === 'customer') {
            query = query.eq('customer_id', id);
        } else if (role === 'delivery') {
            query = query.eq('delivery_id', id);
        }
        // If admin, show all

        const { data, error } = await query;
        if (error) throw error;
        res.json({ success: true, count: data.length, orders: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /orders/:id/assign (Admin only)
router.patch('/:id/assign', auth, admin, async (req, res) => {
    const { id } = req.params;
    const { delivery_id } = req.body;

    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ delivery_id, status: 'processing' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Entregador atribuído', order: data[0] });
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
        const { data: order } = await supabase.from('orders').select('delivery_id').eq('id', id).single();

        if (role === 'delivery' && order.delivery_id !== userId) {
            return res.status(403).json({ success: false, message: 'Este pedido não está atribuído a você.' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Status do pedido atualizado', order: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
