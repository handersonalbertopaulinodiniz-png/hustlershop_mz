import { initAdminPage, formatDate } from './common.js';
import { usersAPI } from '../core/api.js';
import { showToast } from '../components/toast.js';

let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading...</td></tr>';

    const { data, error } = await usersAPI.getAll({
        orderBy: { column: 'created_at', ascending: false }
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Failed to load users</td></tr>';
        return;
    }

    allUsers = data || [];
    renderUsers(allUsers);
}

function renderUsers(users) {
    const tableBody = document.querySelector('tbody');
    const showingCount = document.getElementById('showingCount');

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No users found</td></tr>';
        if (showingCount) showingCount.textContent = 'Showing 0 of 0 users';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-tertiary text-primary flex items-center justify-center font-bold text-xs border border-zinc-800 uppercase tracking-tighter">
                        ${getInitials(user.full_name || user.email || 'U')}
                    </div>
                    <span class="font-bold text-primary">${user.full_name || 'Unnamed User'}</span>
                </div>
            </td>
            <td class="p-4">
                <span class="status-badge ${user.role === 'admin' ? 'success' : 'warning'}">
                    ${user.role}
                </span>
            </td>
            <td class="p-4 text-secondary text-sm">${user.email}</td>
            <td class="p-4">
               <span class="status-badge ${user.approval_status === 'approved' ? 'success' : (user.approval_status === 'pending' ? 'warning' : 'danger')}">
                ${capitalize(user.approval_status || 'approved')}
               </span>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(user.created_at)}</td>
            <td class="p-4 text-right">
                ${user.role !== 'admin' ? `
                <button type="button" aria-label="Delete user" class="btn btn-secondary btn-sm p-2 text-primary hover:bg-zinc-900 transition-colors" onclick="deleteUser('${user.id}')">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');

    lucide.createIcons();

    if (showingCount) showingCount.textContent = `Showing ${users.length} of ${allUsers.length} users`;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setupEventListeners() {
    // Search
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allUsers.filter(u =>
                (u.full_name || '').toLowerCase().includes(query) ||
                (u.email || '').toLowerCase().includes(query)
            );
            renderUsers(filtered);
        });
    }

    // Role Filter
    const filterSelect = document.querySelector('select.select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            if (!role) {
                renderUsers(allUsers);
            } else {
                const filtered = allUsers.filter(u => u.role === role);
                renderUsers(filtered);
            }
        });
    }

    // Add User
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            showToast('Add User feature coming soon', 'info');
        });
    }
}

window.deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        const { success, error } = await usersAPI.delete(id);
        if (success) {
            showToast('User deleted successfully', 'success');
            loadUsers();
        } else {
            showToast('Failed to delete user', 'error');
        }
    }
};
