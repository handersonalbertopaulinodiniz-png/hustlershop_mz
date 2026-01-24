const express = require('express');
const router = express.Router();
const { databases, Query, databaseId } = require('../config/appwrite');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /users (Admin Only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const result = await databases.listDocuments(databaseId, 'profiles', [
            Query.orderDesc('created_at')
        ]);

        res.json({ success: true, count: result.total, users: result.documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /users/:id (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;

    try {
        await databases.deleteDocument(databaseId, 'profiles', id);
        res.json({ success: true, message: 'Perfil do usuário excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
