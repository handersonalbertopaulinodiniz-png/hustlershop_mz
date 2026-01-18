// Success Page Module
import { router } from '../core/router.js';

export const initSuccessPage = () => {
    const params = router.getQueryParams();
    const orderId = params.order;

    if (!orderId) {
        router.navigate('/customer/dashboard.html');
        return;
    }

    // Display success message
    const container = document.getElementById('success-content');
    if (container) {
        container.innerHTML = `
      <div class="success-state animate-fade-in-up">
        <div class="success-icon">✓</div>
        <h1 class="success-title">Order Placed Successfully!</h1>
        <p class="success-message">Your order #${orderId} has been confirmed</p>
        <div class="success-actions">
          <a href="/customer/orders.html" class="btn btn-primary">View Orders</a>
          <a href="/customer/dashboard.html" class="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    `;
    }
};

export default { initSuccessPage };
