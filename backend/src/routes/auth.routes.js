const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, account, databases, ID, Query, databaseId } = require('../config/appwrite');

// POST /auth/register (Clientes e Entregadores)
router.post('/register', async (req, res) => {
    const { full_name, email, password, role } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        // 1. Check if user already exists in profiles
        const existingUsers = await databases.listDocuments(databaseId, 'profiles', [
            Query.equal('email', email)
        ]);

        if (existingUsers.total > 0) {
            return res.status(400).json({ success: false, message: 'Este email já está em uso.' });
        }

        // 2. Create user in Appwrite Auth
        const user = await users.create(
            ID.unique(),
            email,
            password,
            full_name
        );

        // 3. Create profile document with user id as document id
        await databases.createDocument(databaseId, 'profiles', user.$id, {
            user_id: user.$id,
            email,
            full_name,
            role: role || 'customer',
            approval_status: role === 'delivery' ? 'pending' : 'approved',
            created_at: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso. Verifique o seu email para confirmar.',
            user: { id: user.$id, email: user.email, role: role || 'customer' }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no servidor: ' + error.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Sign in with Appwrite Auth (session-based)
        const session = await account.createEmailPasswordSession(email, password);

        if (!session) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        // 2. Get user profile/role
        const profiles = await databases.listDocuments(databaseId, 'profiles', [
            Query.equal('user_id', session.userId)
        ]);
        const profile = profiles.documents[0];

        // 3. Generate custom JWT (optional if using Supabase session, but requested)
        const token = jwt.sign(
            { id: session.userId, email, role: profile?.role || 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: session.userId,
                email,
                full_name: profile?.full_name,
                role: profile?.role || 'customer'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao fazer login: ' + error.message });
    }
});

module.exports = router;
