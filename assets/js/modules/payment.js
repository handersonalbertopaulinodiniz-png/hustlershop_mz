// Payment Module
import { ordersAPI } from '../core/api.js';
import { getCurrentProfile } from '../core/auth.js';
import { cart } from './cart.js';
import { showToast } from '../components/toast.js';
import { router } from '../core/router.js';

export const processPayment = async (paymentData) => {
    const profile = getCurrentProfile();
    if (!profile) return { success: false, error: 'Not authenticated' };

    const cartItems = cart.getItems();
    if (cartItems.length === 0) {
        showToast('Cart is empty', 'error');
        return { success: false, error: 'Cart is empty' };
    }

    try {
        // Create order
        const orderData = {
            user_id: profile.id,
            total_amount: cart.getTotal(),
            status: 'pending',
            payment_method: paymentData.method,
            shipping_address: paymentData.shippingAddress,
            created_at: new Date().toISOString()
        };

        const orderResult = await ordersAPI.create(orderData);

        if (!orderResult.success) {
            throw new Error('Failed to create order');
        }

        // Clear cart
        await cart.clearCart();

        // Redirect to success page
        router.navigate(`/customer/success.html?order=${orderResult.data.id}`);

        return { success: true, order: orderResult.data };
    } catch (error) {
        showToast('Payment failed', 'error');
        return { success: false, error: error.message };
    }
};

export default { processPayment };
