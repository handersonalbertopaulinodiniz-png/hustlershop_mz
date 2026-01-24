import { initAdminPage, formatDate } from './common.js';
import { usersAPI } from '../core/api-appwrite.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadApprovals();
});

async function loadApprovals() {
    const tableBody = document.getElementById('approvalsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-zinc-500">A carregar aprovações pendentes...</td></tr>';

    const { data: users, error } = await usersAPI.getPendingApprovals();

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-primary">Erro: ${error}</td></tr>`;
        return;
    }

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-8 text-center text-zinc-500">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="info" class="w-8 h-8 opacity-20"></i>
                        <span>Nenhuma aprovação pendente encontrada</span>
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
                        <span class="font-bold text-primary">${user.full_name || 'Usuário sem nome'}</span>
                        <span class="text-xs text-tertiary">${user.email}</span>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <span class="status-badge warning">${translateRole(user.role)}</span>
            </td>
            <td class="p-4 text-sm">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1 text-primary">
                        <i data-lucide="credit-card" class="w-3 h-3 text-tertiary"></i>
                        BI: ${user.bi_number || 'Não informado'}
                    </div>
                    ${user.transport_type ? `
                    <div class="flex items-center gap-1 text-tertiary text-xs">
                        <i data-lucide="truck" class="w-3 h-3"></i>
                        Transporte: ${capitalize(user.transport_type)}
                    </div>` : ''}
                </div>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(user.created_at)}</td>
            <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                    <button type="button" aria-label="Aprovar" class="btn btn-primary btn-sm px-3 flex items-center gap-1" onclick="approveUser('${user.id}')">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        Aprovar
                    </button>
                    <button type="button" aria-label="Recusar" class="btn btn-secondary btn-sm px-3 flex items-center gap-1" onclick="rejectUser('${user.id}')">
                        <i data-lucide="x" class="w-4 h-4"></i>
                        Recusar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function translateRole(role) {
    const roles = {
        'admin': 'Administrador',
        'customer': 'Cliente',
        'delivery': 'Estafeta'
    };
    return roles[role] || role;
}

function capitalize(str) {
    if (!str) return '';
    return str.replace('_', ' ').charAt(0).toUpperCase() + str.slice(1);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

window.approveUser = async (id) => {
    if (confirm('Aprovar este usuário?')) {
        const { success } = await usersAPI.approveUser(id);
        if (success) {
            showToast('Usuário aprovado com sucesso!', 'success');
            loadApprovals();
            // Refrescar badge no layout se existir
            if (window.updateApprovalsBadge) window.updateApprovalsBadge();
        }
    }
};

window.rejectUser = async (id) => {
    if (confirm('Recusar e remover este usuário?')) {
        const { success } = await usersAPI.rejectUser(id);
        if (success) {
            showToast('Usuário recusado!', 'success');
            loadApprovals();
            if (window.updateApprovalsBadge) window.updateApprovalsBadge();
        }
    }
};
