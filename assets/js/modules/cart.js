// Cart Module
import { cartAPI } from '../core/api.js';
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
        // If not logged in, we use localStorage for a "guest" cart
        if (!profile) {
            const guestCart = localStorage.getItem('guestCart');
            this.items = guestCart ? JSON.parse(guestCart) : [];
            this.calculateTotal();
            this.notifyListeners();
            return { success: true, data: this.items };
        }

        const result = await cartAPI.getByUser(profile.id);

        if (result.success) {
            this.items = result.data;
            this.calculateTotal();
            this.notifyListeners();
        }

        return result;
    }

    async addItem(productId, quantity = 1, productData = null) {
        const profile = getCurrentProfile();

        if (!profile) {
            // Guest cart logic
            const existingItem = this.items.find(item => item.product_id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    id: `guest_${Date.now()}`,
                    product_id: productId,
                    quantity,
                    products: productData // Store minimal product data for display
                });
            }
            localStorage.setItem('guestCart', JSON.stringify(this.items));
            this.calculateTotal();
            this.notifyListeners();
            showToast('Item adicionado ao carrinho', 'success');
            return { success: true };
        }

        const result = await cartAPI.addItem(profile.id, productId, quantity);

        if (result.success) {
            await this.loadCart();
            showToast('Item adicionado ao carrinho', 'success');
        } else {
            showToast('Falha ao adicionar item ao carrinho', 'error');
        }

        return result;
    }

    async updateQuantity(itemId, quantity) {
        if (quantity < 1) {
            return this.removeItem(itemId);
        }

        const profile = getCurrentProfile();
        if (!profile) {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('guestCart', JSON.stringify(this.items));
                this.calculateTotal();
                this.notifyListeners();
                return { success: true };
            }
            return { success: false };
        }

        const result = await cartAPI.updateQuantity(itemId, quantity);

        if (result.success) {
            await this.loadCart();
        } else {
            showToast('Falha ao atualizar quantidade', 'error');
        }

        return result;
    }

    async removeItem(itemId) {
        const profile = getCurrentProfile();
        if (!profile) {
            this.items = this.items.filter(i => i.id !== itemId);
            localStorage.setItem('guestCart', JSON.stringify(this.items));
            this.calculateTotal();
            this.notifyListeners();
            showToast('Item removido', 'success');
            return { success: true };
        }

        const result = await cartAPI.removeItem(itemId);

        if (result.success) {
            await this.loadCart();
            showToast('Item removido', 'success');
        } else {
            showToast('Falha ao remover item', 'error');
        }

        return result;
    }

    async clearCart(silent = false) {
        const profile = getCurrentProfile();

        if (!silent) {
            const confirmed = confirm('Tem certeza que deseja esvaziar seu carrinho?');
            if (!confirmed) return { success: false };
        }

        if (!profile) {
            this.items = [];
            localStorage.removeItem('guestCart');
            this.calculateTotal();
            this.notifyListeners();
            if (!silent) showToast('Carrinho esvaziado', 'success');
            return { success: true };
        }

        const result = await cartAPI.clearCart(profile.id);

        if (result.success) {
            this.items = [];
            this.total = 0;
            this.notifyListeners();
            if (!silent) showToast('Carrinho esvaziado', 'success');
        } else if (!silent) {
            showToast('Falha ao esvaziar carrinho', 'error');
        }

        return result;
    }

    // Sync guest cart to user cart after login
    async syncCart(userId) {
        const guestCart = localStorage.getItem('guestCart');
        if (!guestCart) return;

        const items = JSON.parse(guestCart);
        for (const item of items) {
            await cartAPI.addItem(userId, item.product_id, item.quantity);
        }
        localStorage.removeItem('guestCart');
        await this.loadCart();
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

    renderCart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon text-6xl mb-4">🛒</div>
                    <h3 class="text-xl font-bold mb-2">Seu carrinho está vazio</h3>
                    <p class="text-secondary mb-6">Adicione alguns produtos incríveis para começar!</p>
                    <a href="dashboard.html" class="btn btn-primary">Começar a Comprar</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-4 mb-8">
                ${this.items.map(item => this.renderCartItem(item)).join('')}
            </div>
            
            <div class="card p-6 bg-surface border shadow-lg">
                <div class="space-y-3 mb-6">
                    <div class="flex justify-between items-center">
                        <span class="text-secondary">Subtotal</span>
                        <span class="font-medium">${this.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-secondary">Frete</span>
                        <span class="text-success font-medium">Grátis</span>
                    </div>
                    <div class="divider"></div>
                    <div class="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span class="gradient-text">${this.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                    </div>
                </div>
                
                <div class="flex flex-col gap-3">
                    <a href="checkout.html" class="btn btn-primary py-4 text-center">Finalizar Compra</a>
                    <button class="btn btn-ghost py-3" data-clear-cart>Esvaziar Carrinho</button>
                    <a href="dashboard.html" class="btn btn-ghost text-sm">Continuar Comprando</a>
                </div>
            </div>
        `;

        this.attachCartEventListeners(container);
    }

    renderCartItem(item) {
        const product = item.products;
        if (!product) return '';

        return `
            <div class="card flex items-center gap-4 p-4 hover:shadow-md transition-all" data-item-id="${item.id}">
                <div class="w-20 h-20 bg-tertiary rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${product.image_url || '../assets/images/placeholder.png'}" 
                         alt="${product.name}" 
                         class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-lg">${product.name}</h4>
                    <p class="text-primary font-semibold">${product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                </div>
                <div class="flex items-center gap-2 bg-tertiary rounded-full p-1">
                    <button class="w-8 h-8 flex items-center justify-center hover:bg-surface rounded-full transition-colors" 
                            data-decrease-qty="${item.id}">-</button>
                    <span class="w-8 text-center font-medium">${item.quantity}</span>
                    <button class="w-8 h-8 flex items-center justify-center hover:bg-surface rounded-full transition-colors" 
                            data-increase-qty="${item.id}">+</button>
                </div>
                <button class="p-2 text-secondary hover:text-error transition-colors" data-remove-item="${item.id}">
                    <span class="text-xl">✕</span>
                </button>
            </div>
        `;
    }

    attachCartEventListeners(container) {
        container.querySelectorAll('[data-increase-qty]').forEach(btn => {
            btn.onclick = () => {
                const itemId = btn.dataset.increaseQty;
                const item = this.items.find(i => i.id === itemId);
                if (item) this.updateQuantity(itemId, item.quantity + 1);
            };
        });

        container.querySelectorAll('[data-decrease-qty]').forEach(btn => {
            btn.onclick = () => {
                const itemId = btn.dataset.decreaseQty;
                const item = this.items.find(i => i.id === itemId);
                if (item && item.quantity > 1) this.updateQuantity(itemId, item.quantity - 1);
                else this.removeItem(itemId);
            };
        });

        container.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.onclick = () => this.removeItem(btn.dataset.removeItem);
        });

        const clearBtn = container.querySelector('[data-clear-cart]');
        if (clearBtn) clearBtn.onclick = () => this.clearCart();
    }

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

    onChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.items, this.total));
    }
}

export const cart = new CartManager();

export const initCart = async () => {
    await cart.loadCart();
    cart.updateCartBadge();
    cart.onChange(() => cart.updateCartBadge());
};

export default cart;
