const express = require('express');
const router = express.Router();
const { databases, Query, databaseId, ID } = require('../config/appwrite');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /products (Public)
router.get('/', async (req, res) => {
    try {
        const result = await databases.listDocuments(databaseId, 'products', [
            Query.equal('is_active', true)
        ]);

        res.json({ success: true, count: result.total, products: result.documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /products (Admin only)
router.post('/', auth, admin, async (req, res) => {
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;

    try {
        const product = await databases.createDocument(databaseId, 'products', ID.unique(), {
            name,
            description,
            price,
            stock_quantity,
            category_id,
            image_url,
            is_active: true,
            created_at: new Date().toISOString()
        });

        res.status(201).json({ success: true, message: 'Produto criado com sucesso', product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /products/:id (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const product = await databases.updateDocument(databaseId, 'products', id, {
            ...updates,
            updated_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'Produto atualizado', product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /products/:id (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;

    try {
        await databases.deleteDocument(databaseId, 'products', id);
        res.json({ success: true, message: 'Produto excluído permanentemente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
