import { initAdminPage, formatDate } from './common.js';
import { usersAPI } from '../core/api.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadApprovals();
});

async function loadApprovals() {
    const tableBody = document.getElementById('approvalsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-zinc-500">Loading pending approvals...</td></tr>';

    const { data: users, error } = await usersAPI.getPendingApprovals();

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-primary">Error: ${error}</td></tr>`;
        return;
    }

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-8 text-center text-zinc-500">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="info" class="w-8 h-8 opacity-20"></i>
                        <span>No pending approvals found</span>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-tertiary text-primary flex items-center justify-center font-bold text-xs border border-zinc-800 uppercase tracking-tighter">
                        ${getInitials(user.full_name || user.email || 'U')}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-bold text-primary">${user.full_name || 'Unnamed User'}</span>
                        <span class="text-xs text-tertiary">${user.email}</span>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <span class="status-badge warning">${user.role}</span>
            </td>
            <td class="p-4">
                <button type="button" class="text-primary hover:underline text-sm flex items-center gap-1">
                    <i data-lucide="file-text" class="w-3 h-3"></i>
                    View ID
                </button>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(user.created_at)}</td>
            <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                    <button type="button" aria-label="Approve" class="btn btn-primary btn-sm px-3" onclick="approveUser('${user.id}')">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        Approve
                    </button>
                    <button type="button" aria-label="Reject" class="btn btn-secondary btn-sm px-3" onclick="rejectUser('${user.id}')">
                        <i data-lucide="x" class="w-4 h-4"></i>
                        Reject
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

window.approveUser = async (id) => {
    if (confirm('Approve this user?')) {
        const { success } = await usersAPI.approveUser(id);
        if (success) {
            showToast('User approved', 'success');
            loadApprovals();
        }
    }
};

window.rejectUser = async (id) => {
    if (confirm('Reject this user?')) {
        const { success } = await usersAPI.rejectUser(id);
        if (success) {
            showToast('User rejected', 'success');
            loadApprovals();
        }
    }
};
