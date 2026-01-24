import { initAdminPage, formatDate } from './common.js';
import { usersAPI } from '../core/api-appwrite.js';
import { showToast } from '../components/toast.js';

let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">A carregar...</td></tr>';

    const { data, error } = await usersAPI.getAll({
        orderBy: { column: 'created_at', ascending: false }
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Falha ao carregar utilizadores</td></tr>';
        return;
    }

    allUsers = data || [];
    renderUsers(allUsers);
}

function renderUsers(users) {
    const tableBody = document.querySelector('tbody');
    const showingCount = document.getElementById('showingCount');

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Nenhum utilizador encontrado</td></tr>';
        if (showingCount) showingCount.textContent = 'A mostrar 0 de 0 utilizadores';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-tertiary text-primary flex items-center justify-center font-bold text-xs border border-zinc-800 uppercase tracking-tighter">
                        ${getInitials(user.full_name || user.email || 'U')}
                    </div>
                    <span class="font-bold text-primary">${user.full_name || 'Utilizador sem nome'}</span>
                </div>
            </td>
            <td class="p-4">
                <span class="status-badge ${user.role === 'admin' ? 'success' : 'warning'}">
                    ${translateRole(user.role)}
                </span>
            </td>
            <td class="p-4 text-secondary text-sm">${user.email}</td>
            <td class="p-4">
               <span class="status-badge ${user.approval_status === 'approved' ? 'success' : (user.approval_status === 'pending' ? 'warning' : 'danger')}">
                ${translateStatus(user.approval_status || 'approved')}
               </span>
            </td>
            <td class="p-4 text-tertiary text-xs tracking-wider uppercase">${formatDate(user.created_at)}</td>
            <td class="p-4 text-right">
                ${user.role !== 'admin' ? `
                <button type="button" aria-label="Eliminar utilizador" class="btn btn-secondary btn-sm p-2 text-primary hover:bg-zinc-900 transition-colors" onclick="deleteUser('${user.id}')">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');

    lucide.createIcons();

    if (showingCount) showingCount.textContent = `A mostrar ${users.length} de ${allUsers.length} utilizadores`;
}

function translateRole(role) {
    const roles = {
        'admin': 'Administrador',
        'customer': 'Cliente',
        'delivery': 'Estafeta'
    };
    return roles[role] || role;
}

function translateStatus(status) {
    const statuses = {
        'approved': 'APROVADO',
        'pending': 'PENDENTE',
        'rejected': 'RECUSADO'
    };
    return statuses[status] || (status ? status.toUpperCase() : 'APROVADO');
}

// ... existing setupEventListeners ...

window.deleteUser = async (id) => {
    if (confirm('Tem certeza que deseja eliminar este utilizador? Esta ação não pode ser desfeita.')) {
        const { success, error } = await usersAPI.delete(id);
        if (success) {
            showToast('Utilizador eliminado com sucesso', 'success');
            loadUsers();
        } else {
            showToast('Falha ao eliminar utilizador', 'error');
        }
    }
};
