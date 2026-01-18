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
        <tr class="border-b hover:bg-tertiary transition">
            <td class="p-4 font-mono text-sm">#${order.id.slice(0, 8)}</td>
            <td class="p-4">
                <span class="font-medium block">${order.users?.full_name || 'Guest/Unknown'}</span>
                <span class="text-xs text-secondary">${order.users?.email || ''}</span>
            </td>
            <td class="p-4 font-bold">${formatCurrency(order.total_amount)}</td>
            <td class="p-4">
                <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td class="p-4 text-secondary text-sm">${formatDate(order.created_at)}</td>
            <td class="p-4 text-right">
                <button class="btn btn-ghost btn-sm" onclick="viewOrder('${order.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'bg-yellow-50 text-yellow-600';
        case 'processing': return 'bg-blue-50 text-blue-600';
        case 'shipped': return 'bg-purple-50 text-purple-600';
        case 'delivered': return 'bg-green-50 text-green-600';
        case 'cancelled': return 'bg-red-50 text-red-600';
        default: return 'bg-gray-50 text-gray-600';
    }
}

window.viewOrder = (id) => {
    alert('Order Details: ' + id + ' (Feature coming soon)');
};
