import { initAdminPage, formatCurrency, formatDate } from './common.js';
import { ordersAPI } from '../core/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadEarnings();
});

async function loadEarnings() {
    try {
        const { data: orders, error } = await ordersAPI.getAll({
            orderBy: { column: 'created_at', ascending: false }
        });

        if (error) throw error;

        // Calculate Stats
        const revenue = orders.filter(o => o.payment_status === 'completed')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const pending = orders.filter(o => o.payment_status === 'pending')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const withdrawals = 0; // Simulated for now

        // Update Stats UI
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = formatCurrency(revenue);
            statValues[1].textContent = formatCurrency(pending);
            statValues[2].textContent = formatCurrency(withdrawals);
        }

        // Render Table
        const tableBody = document.getElementById('earningsTableBody');
        if (!tableBody) return;

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-zinc-500">Sem transações recentes</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
                <td class="p-4 text-xs font-bold text-primary">#${order.id.slice(0, 8)}</td>
                <td class="p-4 text-sm text-primary">${order.profiles?.full_name || 'Cliente'}</td>
                <td class="p-4 font-bold text-primary">${formatCurrency(order.total_amount)}</td>
                <td class="p-4 uppercase text-xs tracking-wider text-tertiary">${order.payment_method || 'M-Pesa'}</td>
                <td class="p-4">
                    <span class="status-badge ${getPaymentStatusClass(order.payment_status)}">
                        ${translatePaymentStatus(order.payment_status)}
                    </span>
                </td>
                <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(order.created_at)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading earnings:', error);
    }
}

function translatePaymentStatus(status) {
    const statuses = {
        'completed': 'CONCLUÍDO',
        'pending': 'PENDENTE',
        'failed': 'FALHOU',
        'refunded': 'REEMBOLSADO'
    };
    return statuses[status] || (status ? status.toUpperCase() : 'PENDENTE');
}

function getPaymentStatusClass(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'failed':
        case 'refunded': return 'danger';
        default: return 'warning';
    }
}
