import { initAdminPage, formatCurrency, formatDate } from './common.js';
import { ordersAPI } from '../core/api-appwrite.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    loadOrders();
});

async function loadOrders() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">A carregar...</td></tr>';

    const { data: orders, error } = await ordersAPI.getAll({
        orderBy: { column: 'created_at', ascending: false }
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Falha ao carregar encomendas</td></tr>';
        return;
    }

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Nenhuma encomenda encontrada</td></tr>';
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
                <span class="font-bold text-primary block">${order.profiles?.full_name || 'Cliente'}</span>
                <span class="text-xs text-tertiary">${order.profiles?.email || ''}</span>
            </td>
            <td class="p-4 font-bold text-primary">${formatCurrency(order.total_amount)}</td>
            <td class="p-4">
                <span class="status-badge ${getStatusBadgeClass(order.status)}">
                    ${translateStatus(order.status)}
                </span>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(order.created_at)}</td>
            <td class="p-4 text-right">
                <button class="btn btn-secondary btn-sm px-3 flex items-center gap-1" onclick="viewOrder('${order.id}')">
                    <i data-lucide="eye" class="w-3 h-3"></i>
                    Ver
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function translateStatus(status) {
    const statuses = {
        'pending': 'PENDENTE',
        'processing': 'PROCESSANDO',
        'shipped': 'ENVIADO',
        'delivered': 'ENTREGUE',
        'cancelled': 'CANCELADO'
    };
    return statuses[status] || status.toUpperCase();
}

// ... existing getStatusBadgeClass ...

window.viewOrder = (id) => {
    alert('Detalhes da Encomenda: ' + id + ' (Funcionalidade em desenvolvimento)');
};
