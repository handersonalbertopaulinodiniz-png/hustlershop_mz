import { initAdminPage, formatCurrency } from './common.js';
import { productsAPI, categoriesAPI } from '../core/api.js';
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
        select.innerHTML = '<option value="all">All Categories</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        // Modal Select
        const modalSelect = document.getElementById('productCategory');
        if (modalSelect) {
            modalSelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }
}

async function loadProducts() {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading...</td></tr>';

    const { data, error } = await productsAPI.getAll({
        select: '*, categories(name)'
    });

    if (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">Failed to load products</td></tr>';
        return;
    }

    allProducts = data || [];
    renderProducts(allProducts);
}

function renderProducts(products) {
    const tableBody = document.querySelector('tbody');
    const showingCount = document.getElementById('showingCount');

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No products found</td></tr>';
        if (showingCount) showingCount.textContent = 'Showing 0 of 0 products';
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr class="border-b hover:bg-tertiary transition">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover">` : '🖼️'}
                    </div>
                    <span class="font-medium">${product.name}</span>
                </div>
            </td>
            <td class="p-4 text-secondary">${product.categories ? product.categories.name : 'Uncategorized'}</td>
            <td class="p-4 font-medium">${formatCurrency(product.price)}</td>
            <td class="p-4">${product.stock_quantity}</td>
            <td class="p-4">
                <span class="text-xs px-2 py-1 rounded-full ${product.stock_quantity > 10 ? 'bg-success-light text-success' : (product.stock_quantity > 0 ? 'bg-warning-light text-warning' : 'bg-error-light text-error')}">
                    ${product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="p-4 text-right">
                <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="editProduct('${product.id}')">✏️</button>
                <button type="button" class="btn btn-ghost btn-sm btn-icon text-error" onclick="deleteProduct('${product.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');

    if (showingCount) showingCount.textContent = `Showing ${products.length} of ${allProducts.length} products`;
}

function setupEventListeners() {
    // Search
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.categories?.name || '').toLowerCase().includes(query)
            );
            renderProducts(filtered);
        });
    }

    // Filter
    const filterSelect = document.querySelector('select.select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const categoryId = e.target.value;
            if (categoryId === 'all') {
                renderProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category_id === categoryId);
                renderProducts(filtered);
            }
        });
    }

    // Add Product Btn
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openProductModal();
        });
    }

    // Modal Cancel
    const cancelBtn = document.getElementById('cancelModalBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }

    // Form Submit
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
}

// Modal Functions
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');

    if (!modal || !form) return;

    if (product) {
        // Edit Mode
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productImage').value = product.image_url || '';
        document.getElementById('productDescription').value = product.description || '';
    } else {
        // Add Mode
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
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
        showToast('Please select a category', 'error');
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
            showToast(`Product ${id ? 'updated' : 'created'} successfully`, 'success');
            closeProductModal();
            loadProducts();
        } else {
            showToast(result.error || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('An unexpected error occurred', 'error');
    }
}

// Global functions for inline click handlers
window.deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        const { success, error } = await productsAPI.delete(id);
        if (success) {
            showToast('Product deleted successfully', 'success');
            loadProducts();
        } else {
            showToast('Failed to delete product', 'error');
        }
    }
};

window.editProduct = (id) => {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        openProductModal(product);
    } else {
        showToast('Product not found', 'error');
    }
};
