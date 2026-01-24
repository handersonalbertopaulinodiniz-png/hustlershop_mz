// Delivery Module
import { deliveriesAPI } from '../core/api-appwrite.js';
import { getCurrentUserProfile as getCurrentProfile } from '../core/auth-appwrite.js';
import { showToast } from '../components/toast.js';

export const getActiveDeliveries = async () => {
  const profile = getCurrentProfile();
  if (!profile) return { success: false };

  return await deliveriesAPI.getActiveDeliveries(profile.id);
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  const result = await deliveriesAPI.update(deliveryId, { status });

  if (result.success) {
    showToast('Delivery status updated', 'success');
  } else {
    showToast('Failed to update delivery status', 'error');
  }

  return result;
};

export const renderDeliveries = async (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const result = await getActiveDeliveries();

  if (!result.success || result.data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🚚</div>
        <h3 class="empty-state-title">No active deliveries</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = result.data.map(delivery => `
    <div class="card delivery-card">
      <h4>Order #${delivery.order_id}</h4>
      <p>Status: <span class="badge badge-${delivery.status}">${delivery.status}</span></p>
      <div class="delivery-actions">
        <button type="button" class="btn btn-primary btn-sm" data-update-delivery="${delivery.id}" data-status="picked_up">
          Mark as Picked Up
        </button>
        <button type="button" class="btn btn-success btn-sm" data-update-delivery="${delivery.id}" data-status="delivered">
          Mark as Delivered
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-update-delivery]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const deliveryId = btn.dataset.updateDelivery;
      const status = btn.dataset.status;
      await updateDeliveryStatus(deliveryId, status);
      await renderDeliveries(containerId);
    });
  });
};

export default { getActiveDeliveries, updateDeliveryStatus, renderDeliveries };
