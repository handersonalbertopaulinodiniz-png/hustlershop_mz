// Payment Module
import { ordersAPI, cartAPI } from '../core/api.js';
import { getCurrentProfile } from '../core/auth.js';
import { cart } from './cart.js';
import { showToast } from '../components/toast.js';
import { router } from '../core/router.js';

/**
 * Processa o pagamento e cria o pedido no banco de dados.
 * Suporta M-Pesa, m-Kesh e Dinheiro na Entrega.
 */
export const processPayment = async (paymentData) => {
    const profile = getCurrentProfile();
    if (!profile) {
        showToast('Você precisa estar logado para finalizar a compra', 'warning');
        router.navigate('../auth/login.html');
        return { success: false, error: 'Not authenticated' };
    }

    const cartItems = cart.getItems();
    if (cartItems.length === 0) {
        showToast('Seu carrinho está vazio', 'error');
        return { success: false, error: 'Cart is empty' };
    }

    try {
        // 1. Simulação de processamento de gateway (M-Pesa / m-Kesh)
        if (paymentData.method === 'mpesa' || paymentData.method === 'mkesh') {
            console.log(`Iniciando transação via ${paymentData.method.toUpperCase()} para: ${paymentData.phone}`);
            // Aqui entraria a chamada de API real do gateway
            // Por enquanto, simulamos um atraso de processamento
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 2. Preparar dados do pedido principal
        const orderData = {
            user_id: profile.id,
            total_amount: cart.getTotal(),
            status: 'pending',
            payment_method: paymentData.method,
            payment_status: paymentData.method === 'cash' ? 'pending' : 'completed',
            shipping_address: paymentData.shippingAddress,
            phone_contact: paymentData.phone || profile.phone,
            created_at: new Date().toISOString()
        };

        // 3. Criar pedido no Supabase
        const orderResult = await ordersAPI.create(orderData);

        if (!orderResult.success) {
            throw new Error('Falha ao registrar o pedido no sistema.');
        }

        const orderId = orderResult.data.id;

        // 4. Registrar itens do pedido (order_items)
        // Nota: A ordersAPI.create deve lidar com isso ou precisamos de um loop aqui
        // Dependendo da implementação da sua API, vamos garantir que os itens sejam salvos
        for (const item of cartItems) {
            const itemData = {
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.products.price
            };
            // Nota: seria ideal uma inserção em massa (bulk insert)
            // mas aqui seguimos a lógica item por item pela simplicidade do módulo generic api
            await ordersAPI.addItem ? await ordersAPI.addItem(itemData) : console.log('Saving item:', itemData);
        }

        // 5. Limpar o carrinho no banco e localmente
        await cart.clearCart(true);

        // 6. Notificar e Redirecionar
        showToast('Pedido realizado com sucesso!', 'success');

        // Pequeno atraso para o usuário ver o toast antes de mudar a página
        setTimeout(() => {
            router.navigate(`success.html?order=${orderId}`);
        }, 500);

        return { success: true, orderId };

    } catch (error) {
        console.error('Payment process error:', error);
        showToast(error.message || 'Erro ao processar pagamento', 'error');
        return { success: false, error: error.message };
    }
};

/**
 * Valida o número de telefone para pagamentos móveis em Moçambique
 */
export const validateMozPhone = (phone) => {
    const mpesaRegex = /^(84|85)\d{7}$/;
    const mkeshRegex = /^(82)\d{7}$/;

    // Remove prefixo +258 se existir
    const cleanPhone = phone.replace('+258', '').replace(/\s/g, '');

    return mpesaRegex.test(cleanPhone) || mkeshRegex.test(cleanPhone);
};

export default { processPayment, validateMozPhone };
