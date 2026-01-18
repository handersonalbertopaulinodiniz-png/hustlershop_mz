const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// POST /payments/intent (Cliente)
// Inicia um processo de pagamento (Simulação ou integração futura)
router.post('/intent', auth, async (req, res) => {
    const { order_id, amount, method } = req.body;

    if (!order_id || !amount || !method) {
        return res.status(400).json({ success: false, message: 'Dados de pagamento incompletos.' });
    }

    try {
        // 1. Verificar se o pedido existe
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
        }

        // 2. Simular criação de transação no banco
        // No futuro, aqui seria a chamada para Stripe, M-Pesa ou e-Mola
        const paymentIntent = {
            order_id,
            amount,
            method,
            status: 'pending',
            transaction_id: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            created_at: new Date()
        };

        // 3. Atualizar o status de pagamento do pedido para 'processing'
        await supabase
            .from('orders')
            .update({ payment_status: 'pending' })
            .eq('id', order_id);

        res.json({
            success: true,
            message: 'Intenção de pagamento criada com sucesso.',
            payment: paymentIntent
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /payments/webhook (Simulado)
// Atualiza o status do pagamento
router.post('/status', auth, async (req, res) => {
    const { order_id, status } = req.body; // status: completed, failed

    try {
        const { data: order, error } = await supabase
            .from('orders')
            .update({ payment_status: status })
            .eq('id', order_id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: `Status de pagamento atualizado para ${status}`,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
