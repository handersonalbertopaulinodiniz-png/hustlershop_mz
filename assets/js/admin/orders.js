import { initAdminPage, formatCurrency, formatDate } from './common.js';
import { ordersAPI } from '../core/api.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    loadOrders();
});

async function loadOrders() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading...</td></tr>';

    const { data: orders, error } = await ordersAPI.getAll({
        orderBy: { column: 'created_at', ascending: false }
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Failed to load orders</td></tr>';
        return;
    }

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No orders found</td></tr>';
        return;
    }

    renderOrders(orders);
}

function renderOrders(orders) {
    const tableBody = document.querySelector('tbody');

    tableBody.innerHTML = orders.map(order => `
        <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
            <td class="p-4 font-bold text-primary text-xs uppercase tracking-tighter">#${order.id.slice(0, 8)}</td>
            <td class="p-4">
                <span class="font-bold text-primary block">${order.users?.full_name || 'Customer'}</span>
                <span class="text-xs text-tertiary">${order.users?.email || ''}</span>
            </td>
            <td class="p-4 font-bold text-primary">${formatCurrency(order.total_amount)}</td>
            <td class="p-4">
                <span class="status-badge ${getStatusBadgeClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(order.created_at)}</td>
            <td class="p-4 text-right">
                <button class="btn btn-secondary btn-sm px-3 flex items-center gap-1" onclick="viewOrder('${order.id}')">
                    <i data-lucide="eye" class="w-3 h-3"></i>
                    View
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'pending':
        case 'processing': return 'warning';
        case 'shipped':
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return 'warning';
    }
}

window.viewOrder = (id) => {
    alert('Order Details: ' + id + ' (Feature coming soon)');
};
