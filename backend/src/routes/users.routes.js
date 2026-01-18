const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /users (Admin Only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, count: data.length, users: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /users/:id (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
    const { id } = req.params;

    try {
        // Note: Deleting from profiles is easy, but deleting from Supabase Auth requires Admin API
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Perfil do usuário excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
