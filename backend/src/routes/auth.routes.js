const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

// POST /auth/register (Clientes e Entregadores)
router.post('/register', async (req, res) => {
    const { full_name, email, password, role } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        // 1. Check if user already exists in Supabase Auth (or profile table)
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Este email já está em uso.' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name, role: role || 'customer' }
            }
        });

        if (authError) throw authError;

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso. Verifique o seu email para confirmar.',
            user: { id: authData.user.id, email: authData.user.email, role: role || 'customer' }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no servidor: ' + error.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        // 2. Get user profile/role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single();

        // 3. Generate custom JWT (optional if using Supabase session, but requested)
        const token = jwt.sign(
            { id: data.user.id, email: data.user.email, role: profile?.role || 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile?.full_name,
                role: profile?.role || 'customer'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao fazer login: ' + error.message });
    }
});

module.exports = router;
