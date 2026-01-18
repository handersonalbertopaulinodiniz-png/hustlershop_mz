// Products Module
import { productsAPI } from '../core/api.js';
import { cart } from './cart.js';
import { showToast } from '../components/toast.js';

export const renderProducts = async (containerId, options = {}) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';

    const result = await productsAPI.getAll(options);

    if (!result.success) {
        container.innerHTML = `
      <div class="error-state">
        <p>Failed to load products</p>
      </div>
    `;
        return;
    }

    const products = result.data;

    if (products.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3 class="empty-state-title">No products found</h3>
      </div>
    `;
        return;
    }

    container.innerHTML = `
    <div class="grid grid-cols-4 gap-6">
      ${products.map(product => renderProductCard(product)).join('')}
    </div>
  `;

    attachProductEventListeners(container);
};

export const renderProductCard = (product) => {
    return `
    <div class="card product-card hover-lift" data-product-id="${product.id}">
      <img src="${product.image_url || '/assets/images/placeholder.png'}" 
           alt="${product.name}" 
           class="product-image">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || ''}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-sm" data-add-to-cart="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
};

const attachProductEventListeners = (container) => {
    container.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = btn.dataset.addToCart;
            await cart.addItem(productId, 1);
        });
    });

    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.dataset.productId;
            window.location.href = `/customer/product.html?id=${productId}`;
        });
    });
};

export default { renderProducts, renderProductCard };
