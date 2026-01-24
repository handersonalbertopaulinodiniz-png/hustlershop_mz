const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, account, databases, ID, Query, databaseId, publicClient } = require('../config/appwrite');
const { Client, Account } = require('node-appwrite');
const appwriteAuthMiddleware = require('../middleware/appwriteAuth');

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

        // 3. Generate custom JWT
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

// Middleware para validar JWT
const validateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// GET /auth/validate - Validação de acesso usando JWT
router.get('/validate', validateJWT, async (req, res) => {
    try {
        const profiles = await databases.listDocuments(databaseId, 'profiles', [
            Query.equal('user_id', req.user.id)
        ]);
        const profile = profiles.documents[0];
        
        res.json({
            success: true,
            message: `Olá, ${profile?.full_name || req.user.email}`,
            user: {
                id: req.user.id,
                email: req.user.email,
                full_name: profile?.full_name,
                role: profile?.role || 'customer'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao validar usuário: ' + error.message });
    }
});

// GET /auth/validate-appwrite - Validação usando JWT do Appwrite com middleware
router.get('/validate-appwrite', appwriteAuthMiddleware, async (req, res) => {
    try {
        // Buscar perfil adicional no banco de dados
        const profiles = await databases.listDocuments(databaseId, 'profiles', [
            Query.equal('user_id', req.user.id)
        ]);
        const profile = profiles.documents[0];
        
        res.json({
            success: true,
            message: `Olá, ${profile?.full_name || req.user.name}`,
            user: {
                id: req.user.id,
                email: req.user.email,
                full_name: profile?.full_name || req.user.name,
                role: profile?.role || 'customer',
                verified: req.user.verified
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao validar usuário: ' + error.message 
        });
    }
});

// POST /auth/create-jwt - Criar JWT Appwrite para frontend
router.post('/create-jwt', appwriteAuthMiddleware, async (req, res) => {
    try {
        // Usar o client já autenticado do middleware
        const account = new Account(req.appwriteClient);
        const jwt = await account.createJWT();
        
        res.json({
            success: true,
            jwt: jwt.jwt,
            expiresAt: jwt.expiresAt
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar JWT: ' + error.message 
        });
    }
});

module.exports = router;
