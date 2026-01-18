// Cart Module
import { cartAPI, productsAPI } from '../core/api.js';
import { getCurrentProfile } from '../core/auth.js';
import { showToast } from '../components/toast.js';

class CartManager {
    constructor() {
        this.items = [];
        this.total = 0;
        this.listeners = [];
    }

    async loadCart() {
        const profile = getCurrentProfile();
        if (!profile) return { success: false, error: 'Not authenticated' };

        const result = await cartAPI.getByUser(profile.id);

        if (result.success) {
            this.items = result.data;
            this.calculateTotal();
            this.notifyListeners();
        }

        return result;
    }

    async addItem(productId, quantity = 1) {
        const profile = getCurrentProfile();
        if (!profile) {
            showToast('Please sign in to add items to cart', 'warning');
            return { success: false };
        }

        const result = await cartAPI.addItem(profile.id, productId, quantity);

        if (result.success) {
            await this.loadCart();
            showToast('Item added to cart', 'success');
        } else {
            showToast('Failed to add item to cart', 'error');
        }

        return result;
    }

    async updateQuantity(itemId, quantity) {
        if (quantity < 1) {
            return this.removeItem(itemId);
        }

        const result = await cartAPI.updateQuantity(itemId, quantity);

        if (result.success) {
            await this.loadCart();
            showToast('Cart updated', 'success');
        } else {
            showToast('Failed to update cart', 'error');
        }

        return result;
    }

    async removeItem(itemId) {
        const result = await cartAPI.removeItem(itemId);

        if (result.success) {
            await this.loadCart();
            showToast('Item removed from cart', 'success');
        } else {
            showToast('Failed to remove item', 'error');
        }

        return result;
    }

    async clearCart() {
        const profile = getCurrentProfile();
        if (!profile) return { success: false };

        const confirmed = confirm('Are you sure you want to clear your cart?');
        if (!confirmed) return { success: false };

        const result = await cartAPI.clearCart(profile.id);

        if (result.success) {
            this.items = [];
            this.total = 0;
            this.notifyListeners();
            showToast('Cart cleared', 'success');
        } else {
            showToast('Failed to clear cart', 'error');
        }

        return result;
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            const price = item.products?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotal() {
        return this.total;
    }

    getItems() {
        return this.items;
    }

    isInCart(productId) {
        return this.items.some(item => item.product_id === productId);
    }

    getCartItem(productId) {
        return this.items.find(item => item.product_id === productId);
    }

    // Event listeners
    onChange(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.items, this.total));
    }

    // Render cart
    renderCart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3 class="empty-state-title">Your cart is empty</h3>
          <p class="empty-state-description">Add some items to get started</p>
          <a href="/customer/dashboard.html" class="btn btn-primary">
            Continue Shopping
          </a>
        </div>
      `;
            return;
        }

        container.innerHTML = `
      <div class="cart-items">
        ${this.items.map(item => this.renderCartItem(item)).join('')}
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span>$${this.total.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>$${this.total.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary w-full" onclick="window.location.href='/customer/checkout.html'">
          Proceed to Checkout
        </button>
        <button class="btn btn-ghost w-full" data-clear-cart>
          Clear Cart
        </button>
      </div>
    `;

        // Add event listeners
        this.attachCartEventListeners(container);
    }

    renderCartItem(item) {
        const product = item.products;
        if (!product) return '';

        return `
      <div class="cart-item" data-item-id="${item.id}">
        <img src="${product.image_url || '/assets/images/placeholder.png'}" 
             alt="${product.name}" 
             class="cart-item-image">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${product.name}</h4>
          <p class="cart-item-price">$${product.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="btn btn-sm btn-ghost" data-decrease-qty="${item.id}">-</button>
          <input type="number" 
                 value="${item.quantity}" 
                 min="1" 
                 class="cart-item-qty-input"
                 data-qty-input="${item.id}">
          <button class="btn btn-sm btn-ghost" data-increase-qty="${item.id}">+</button>
        </div>
        <div class="cart-item-total">
          $${(product.price * item.quantity).toFixed(2)}
        </div>
        <button class="btn btn-sm btn-ghost" data-remove-item="${item.id}">
          ✕
        </button>
      </div>
    `;
    }

    attachCartEventListeners(container) {
        // Increase quantity
        container.querySelectorAll('[data-increase-qty]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.increaseQty;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });

        // Decrease quantity
        container.querySelectorAll('[data-decrease-qty]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.decreaseQty;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });

        // Quantity input change
        container.querySelectorAll('[data-qty-input]').forEach(input => {
            input.addEventListener('change', () => {
                const itemId = input.dataset.qtyInput;
                const quantity = parseInt(input.value);
                if (quantity > 0) {
                    this.updateQuantity(itemId, quantity);
                }
            });
        });

        // Remove item
        container.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.removeItem;
                this.removeItem(itemId);
            });
        });

        // Clear cart
        const clearBtn = container.querySelector('[data-clear-cart]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }
    }

    // Update cart badge
    updateCartBadge() {
        const badges = document.querySelectorAll('[data-cart-badge]');
        const count = this.getItemCount();

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }
}

// Create singleton instance
export const cart = new CartManager();

// Initialize cart
export const initCart = async () => {
    await cart.loadCart();
    cart.updateCartBadge();

    // Listen for cart changes
    cart.onChange(() => {
        cart.updateCartBadge();
    });
};

export default cart;
