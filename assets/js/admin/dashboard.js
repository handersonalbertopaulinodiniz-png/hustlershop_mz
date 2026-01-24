import { initAdminPage, formatCurrency, formatDate } from './common.js';
import { api, ordersAPI, usersAPI } from '../core/api-appwrite.js';
import { COLLECTIONS as TABLES } from '../core/appwrite.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    loadDashboardStats();
    loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        // 1. Total Sales
        const { data: orders } = await ordersAPI.getAll({
            filters: { status: 'delivered' }
        });

        const totalSales = orders ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0;

        // 2. Total Orders
        const { count: totalOrders } = await api.count(TABLES.ORDERS);

        // 3. Total Users
        const { count: totalUsers } = await api.count(TABLES.USERS);

        // 4. Pending Approvals
        const { data: pendingUsers } = await usersAPI.getPendingApprovals();
        const pendingCount = pendingUsers ? pendingUsers.length : 0;

        // Update UI - Using the new selectors for the premium design
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = formatCurrency(totalSales);
            statValues[1].textContent = `+${totalUsers || 0}`; // "New Customers" mapped to Total Users for now
            statValues[2].textContent = `+${totalOrders || 0}`; // "Active Orders" mapped to Total Orders
            statValues[3].textContent = pendingCount;
        }

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivity() {
    const activityContainer = document.querySelector('.sales-list');
    if (!activityContainer) return;

    const { data: recentOrders } = await ordersAPI.getAll({
        limit: 5,
        orderBy: { column: 'created_at', ascending: false }
    });

    if (!recentOrders || recentOrders.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <p class="text-secondary text-sm">Sem transações recentes</p>
            </div>
        `;
        return;
    }

    const activityHTML = recentOrders.map(order => {
        const customerName = order.profiles?.full_name || 'Utilizador Anónimo';
        const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        return `
            <div class="sale-item cursor-pointer" onclick="window.location.href='orders.html?id=${order.id}'">
                <div class="item-left">
                    <div class="avatar">${initials}</div>
                    <div class="item-info">
                        <span class="item-name">${customerName}</span>
                        <span class="item-email">Encomenda #${order.id.slice(0, 8)} • ${formatDate(order.created_at)}</span>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-amount">+${formatCurrency(order.total_amount)}</span>
                    <span class="status-badge ${getStatusBadgeClass(order.status)}">${translateStatus(order.status)}</span>
                </div>
            </div>
        `;
    }).join('');

    activityContainer.innerHTML = activityHTML;
}

function translateStatus(status) {
    const statuses = {
        'pending': 'PENDENTE',
        'processing': 'PROCESSANDO',
        'shipped': 'ENVIADO',
        'delivered': 'ENTREGUE',
        'cancelled': 'CANCELADO',
        'completed': 'CONCLUÍDO'
    };
    return statuses[status] || status.toUpperCase();
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'pending':
        case 'processing':
            return 'warning';
        case 'delivered':
        case 'completed':
            return 'success';
        case 'shipped':
            return 'success';
        case 'cancelled':
        case 'failed':
            return 'danger';
        default:
            return 'success';
    }
}

