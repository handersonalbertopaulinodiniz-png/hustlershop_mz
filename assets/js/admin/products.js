import { initAdminPage, formatCurrency } from './common.js';
import { productsAPI, categoriesAPI } from '../core/api-appwrite.js';
import { showToast } from '../components/toast.js';

let allProducts = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    await loadCategories(); // Load categories for the filter
    await loadProducts();
    setupEventListeners();
});

async function loadCategories() {
    const { data: categories } = await categoriesAPI.getAll();
    if (categories) {
        // Filter Select
        const select = document.querySelector('select.select');
        select.innerHTML = '<option value="all">Todas as Categorias</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        // Modal Select
        const modalSelect = document.getElementById('productCategory');
        if (modalSelect) {
            modalSelect.innerHTML = '<option value="">Selecionar Categoria</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }
}

async function loadProducts() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">A carregar...</td></tr>';

    const { data, error } = await productsAPI.getAll({
        select: '*, categories(name)'
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Falha ao carregar produtos</td></tr>';
        return;
    }

    allProducts = data || [];
    renderProducts(allProducts);
}

function renderProducts(products) {
    const tableBody = document.querySelector('tbody');
    const showingCount = document.getElementById('showingCount');

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Nenhum produto encontrado</td></tr>';
        if (showingCount) showingCount.textContent = 'A mostrar 0 de 0 produtos';
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr class="border-b border-zinc-800 hover:bg-tertiary transition-all">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center overflow-hidden border border-zinc-800">
                        ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover">` : '<i data-lucide="image" class="w-5 h-5 text-tertiary"></i>'}
                    </div>
                    <span class="font-bold text-primary">${product.name}</span>
                </div>
            </td>
            <td class="p-4 text-secondary uppercase text-xs tracking-wider">${product.categories ? product.categories.name : 'Sem Categoria'}</td>
            <td class="p-4 font-bold text-primary">${formatCurrency(product.price)}</td>
            <td class="p-4 text-primary">${product.stock_quantity}</td>
            <td class="p-4">
                <span class="status-badge ${product.stock_quantity > 0 ? 'success' : 'danger'}">
                    ${product.stock_quantity > 0 ? 'Em Stock' : 'Sem Stock'}
                </span>
            </td>
            <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                    <button type="button" aria-label="Editar produto" class="btn btn-secondary btn-sm p-2" onclick="editProduct('${product.id}')">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button type="button" aria-label="Eliminar produto" class="btn btn-secondary btn-sm p-2 text-primary hover:bg-zinc-900 transition-colors" onclick="deleteProduct('${product.id}')">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();

    if (showingCount) showingCount.textContent = `A mostrar ${products.length} de ${allProducts.length} produtos`;
}

// ... existing setupEventListeners ...

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');

    if (!modal || !form) return;

    if (product) {
        // Edit Mode
        title.textContent = 'Editar Produto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productImage').value = product.image_url || '';
        document.getElementById('productDescription').value = product.description || '';
    } else {
        // Add Mode
        title.textContent = 'Adicionar Produto';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.classList.add('active');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        category_id: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock_quantity: parseInt(document.getElementById('productStock').value),
        image_url: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };

    if (!data.category_id) {
        showToast('Por favor, selecione uma categoria', 'error');
        return;
    }

    try {
        let result;
        if (id) {
            result = await productsAPI.update(id, data);
        } else {
            result = await productsAPI.create(data);
        }

        if (result.success) {
            showToast(`Produto ${id ? 'atualizado' : 'criado'} com sucesso`, 'success');
            closeProductModal();
            loadProducts();
        } else {
            showToast(result.error || 'A operação falhou', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Ocorreu um erro inesperado', 'error');
    }
}

window.deleteProduct = async (id) => {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
        const { success, error } = await productsAPI.delete(id);
        if (success) {
            showToast('Produto eliminado com sucesso', 'success');
            loadProducts();
        } else {
            showToast('Falha ao eliminar produto', 'error');
        }
    }
};

window.editProduct = (id) => {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        openProductModal(product);
    } else {
        showToast('Produto não encontrado', 'error');
    }
};
