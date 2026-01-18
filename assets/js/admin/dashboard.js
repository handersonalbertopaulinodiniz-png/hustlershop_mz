import { initAdminPage, formatCurrency, formatDate } from './common.js';
import { api, ordersAPI, usersAPI } from '../core/api.js';
import { TABLES } from '../core/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    loadDashboardStats();
    loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        // 1. Total Sales (Client-side aggregation - strictly for MVP/Demo, heavy for real production)
        const { data: orders } = await ordersAPI.getAll({
            filters: { status: 'delivered' }
        });

        const totalSales = orders ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0;

        // 2. Total Orders (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: newOrdersCount } = await api.count(TABLES.ORDERS, {
            // In a real app we'd filter by date > today. Supabase simple filter might need 'gte' logic which api.js might not expose fully in 'filters' object if it only does 'eq'.
            // Let's just count ALL orders for now or check api.js capability.
            // api.js 'filters' does 'eq'. To do 'gte', we'd need to expand api.js or use logic here.
            // For now, let's just show Total Orders count.
        });
        const { count: totalOrders } = await api.count(TABLES.ORDERS);

        // 3. Total Users
        const { count: totalUsers } = await api.count(TABLES.USERS);

        // 4. Pending Approvals
        const { data: pendingUsers } = await usersAPI.getPendingApprovals();
        const pendingCount = pendingUsers ? pendingUsers.length : 0;

        // Update UI
        document.querySelector('.stat-card:nth-child(1) h3').textContent = formatCurrency(totalSales);
        document.querySelector('.stat-card:nth-child(2) h3').textContent = totalOrders || 0;
        document.querySelector('.stat-card:nth-child(3) h3').textContent = totalUsers || 0;
        document.querySelector('.stat-card:nth-child(4) h3').textContent = pendingCount;

        // Update subtexts (dynamic if possible, else status quo)
        document.querySelector('.stat-card:nth-child(2) span').textContent = 'Total Orders';

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivity() {
    const activityContainer = document.querySelector('.card-body');
    const { data: recentOrders } = await ordersAPI.getAll({
        limit: 5,
        orderBy: { column: 'created_at', ascending: false }
    });

    if (!recentOrders || recentOrders.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <p class="text-secondary">No recent activity</p>
            </div>
        `;
        return;
    }

    const activityHTML = recentOrders.map(order => `
        <div class="flex items-center justify-between py-3 border-b last:border-0 hover:bg-tertiary px-2 rounded -mx-2 transition cursor-pointer" onclick="window.location.href='orders.html?id=${order.id}'">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    📦
                </div>
                <div>
                    <p class="font-medium m-0">Order #${order.id.slice(0, 8)}</p>
                    <p class="text-xs text-secondary m-0">${formatDate(order.created_at)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-sm m-0">${formatCurrency(order.total_amount)}</p>
                <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </div>
        </div>
    `).join('');

    activityContainer.innerHTML = activityHTML;
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
