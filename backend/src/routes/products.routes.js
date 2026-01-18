const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /products (Public)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;
        res.json({ success: true, count: data.length, products: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /products (Admin only)
router.post('/', auth, admin, async (req, res) => {
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, description, price, stock_quantity, category_id, image_url }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: 'Produto criado com sucesso', product: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /products/:id (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Produto atualizado', product: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /products/:id (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Produto excluído permanentemente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
