// API Module - Centralized API calls
import { appwriteHelpers, COLLECTIONS } from './appwrite.js';

// Generic CRUD Operations
export const api = {
    // Get all records from a table
    getAll: async (table, options = {}) => {
        try {
            const queries = [];

            // Apply filters
            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    queries.push(appwriteHelpers.query.equal(key, value));
                });
            }

            // Apply ordering
            if (options.orderBy) {
                if (options.orderBy.ascending !== false) {
                    queries.push(appwriteHelpers.query.orderAsc(options.orderBy.column));
                } else {
                    queries.push(appwriteHelpers.query.orderDesc(options.orderBy.column));
                }
            }

            // Apply limit
            if (options.limit) {
                queries.push(appwriteHelpers.query.limit(options.limit));
            }

            // Apply offset
            if (options.offset) {
                queries.push(appwriteHelpers.query.offset(options.offset));
            }

            const result = await appwriteHelpers.listDocuments(table, queries);

            if (!result.success) throw new Error(result.error);

            // Handle select option (simplified)
            let data = result.data.documents;
            if (options.select && options.select !== '*') {
                // Basic select implementation - would need more complex parsing for full support
                const fields = options.select.split(',').map(f => f.trim());
                data = data.map(doc => {
                    const selected = {};
                    fields.forEach(field => {
                        if (doc[field] !== undefined) {
                            selected[field] = doc[field];
                        }
                    });
                    return selected;
                });
            }

            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching from ${table}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Get single record by ID
    getById: async (table, id, select = '*') => {
        try {
            const result = await appwriteHelpers.getDocument(table, id);

            if (!result.success) throw new Error(result.error);

            // Handle select option
            let data = result.data;
            if (select && select !== '*') {
                const fields = select.split(',').map(f => f.trim());
                const selected = {};
                fields.forEach(field => {
                    if (data[field] !== undefined) {
                        selected[field] = data[field];
                    }
                });
                data = selected;
            }

            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching ${table} by ID:`, error);
            return { success: false, error: error.message };
        }
    },

    // Create new record
    create: async (table, data) => {
        try {
            const result = await appwriteHelpers.createDocument(table, data);

            if (!result.success) throw new Error(result.error);

            return { success: true, data: result.data };
        } catch (error) {
            console.error(`Error creating in ${table}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Update record
    update: async (table, id, data) => {
        try {
            const result = await appwriteHelpers.updateDocument(table, id, data);

            if (!result.success) throw new Error(result.error);

            return { success: true, data: result.data };
        } catch (error) {
            console.error(`Error updating ${table}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Delete record
    delete: async (table, id) => {
        try {
            const result = await appwriteHelpers.deleteDocument(table, id);

            if (!result.success) throw new Error(result.error);

            return { success: true };
        } catch (error) {
            console.error(`Error deleting from ${table}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Count records
    count: async (table, filters = {}) => {
        try {
            const queries = [];

            Object.entries(filters).forEach(([key, value]) => {
                queries.push(appwriteHelpers.query.equal(key, value));
            });

            const result = await appwriteHelpers.listDocuments(table, queries);

            if (!result.success) throw new Error(result.error);

            return { success: true, count: result.data.total };
        } catch (error) {
            console.error(`Error counting ${table}:`, error);
            return { success: false, error: error.message };
        }
    }
};

// Products API
export const productsAPI = {
    getAll: (options) => api.getAll(COLLECTIONS.PRODUCTS, options),
    getById: (id) => api.getById(COLLECTIONS.PRODUCTS, id),
    create: (data) => api.create(COLLECTIONS.PRODUCTS, data),
    update: (id, data) => api.update(COLLECTIONS.PRODUCTS, id, data),
    delete: (id) => api.delete(COLLECTIONS.PRODUCTS, id),

    search: async (query) => {
        try {
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.PRODUCTS, [
                appwriteHelpers.query.search('name', query),
                appwriteHelpers.query.limit(20)
            ]);

            if (!result.success) throw new Error(result.error);

            return { success: true, data: result.data.documents };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getByCategory: async (categoryId) => {
        return api.getAll(COLLECTIONS.PRODUCTS, {
            filters: { category_id: categoryId }
        });
    }
};

// Orders API
export const ordersAPI = {
    getAll: (options) => api.getAll(COLLECTIONS.ORDERS, options),
    getById: (id) => api.getById(COLLECTIONS.ORDERS, id),
    create: (data) => api.create(COLLECTIONS.ORDERS, data),
    update: (id, data) => api.update(COLLECTIONS.ORDERS, id, data),
    delete: (id) => api.delete(COLLECTIONS.ORDERS, id),

    getByUser: async (userId) => {
        return api.getAll(COLLECTIONS.ORDERS, {
            filters: { user_id: userId },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    getByStatus: async (status) => {
        return api.getAll(COLLECTIONS.ORDERS, {
            filters: { status },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    // Adiciona um item ao pedido
    addItem: (data) => api.create(COLLECTIONS.ORDER_ITEMS, data),

    // Adiciona múltiplos itens de uma vez (Bulk Insert)
    addItems: async (items) => {
        try {
            const results = [];
            for (const item of items) {
                const result = await appwriteHelpers.createDocument(COLLECTIONS.ORDER_ITEMS, item);
                if (!result.success) throw new Error(result.error);
                results.push(result.data);
            }
            return { success: true, data: results };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Cart API
export const cartAPI = {
    getByUser: async (userId) => {
        return api.getAll(COLLECTIONS.CART, {
            filters: { user_id: userId }
        });
    },

    addItem: async (userId, productId, quantity = 1) => {
        try {
            // Check if item already exists
            const existingResult = await appwriteHelpers.listDocuments(COLLECTIONS.CART, [
                appwriteHelpers.query.equal('user_id', userId),
                appwriteHelpers.query.equal('product_id', productId)
            ]);

            if (!existingResult.success) throw new Error(existingResult.error);

            if (existingResult.data.documents.length > 0) {
                // Update quantity
                const existing = existingResult.data.documents[0];
                return api.update(COLLECTIONS.CART, existing.id, {
                    quantity: existing.quantity + quantity
                });
            } else {
                // Create new item
                return api.create(COLLECTIONS.CART, {
                    user_id: userId,
                    product_id: productId,
                    quantity
                });
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateQuantity: (id, quantity) => api.update(COLLECTIONS.CART, id, { quantity }),
    removeItem: (id) => api.delete(COLLECTIONS.CART, id),

    clearCart: async (userId) => {
        try {
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.CART, [
                appwriteHelpers.query.equal('user_id', userId)
            ]);

            if (!result.success) throw new Error(result.error);

            // Delete all items
            for (const item of result.data.documents) {
                await appwriteHelpers.deleteDocument(COLLECTIONS.CART, item.id);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Wishlist API
export const wishlistAPI = {
    getByUser: async (userId) => {
        return api.getAll(COLLECTIONS.WISHLIST, {
            filters: { user_id: userId }
        });
    },

    addItem: (userId, productId) => api.create(COLLECTIONS.WISHLIST, {
        user_id: userId,
        product_id: productId
    }),

    removeItem: async (userId, productId) => {
        try {
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.WISHLIST, [
                appwriteHelpers.query.equal('user_id', userId),
                appwriteHelpers.query.equal('product_id', productId)
            ]);

            if (!result.success) throw new Error(result.error);

            if (result.data.documents.length > 0) {
                await appwriteHelpers.deleteDocument(COLLECTIONS.WISHLIST, result.data.documents[0].id);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    isInWishlist: async (userId, productId) => {
        try {
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.WISHLIST, [
                appwriteHelpers.query.equal('user_id', userId),
                appwriteHelpers.query.equal('product_id', productId)
            ]);

            return { success: true, exists: result.data.documents.length > 0 };
        } catch (error) {
            return { success: true, exists: false };
        }
    }
};


// Users API
export const usersAPI = {
    getAll: (options) => api.getAll(COLLECTIONS.USERS, options),
    getById: (id) => api.getById(COLLECTIONS.USERS, id),
    update: (id, data) => api.update(COLLECTIONS.USERS, id, data),
    delete: (id) => api.delete(COLLECTIONS.USERS, id),

    getPendingApprovals: async () => {
        return api.getAll(COLLECTIONS.USERS, {
            filters: { approval_status: 'pending' },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    approveUser: (id) => api.update(COLLECTIONS.USERS, id, {
        approval_status: 'approved'
    }),

    rejectUser: (id) => api.update(COLLECTIONS.USERS, id, {
        approval_status: 'rejected'
    })
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.getAll(COLLECTIONS.CATEGORIES),
    getById: (id) => api.getById(COLLECTIONS.CATEGORIES, id),
    create: (data) => api.create(COLLECTIONS.CATEGORIES, data),
    update: (id, data) => api.update(COLLECTIONS.CATEGORIES, id, data),
    delete: (id) => api.delete(COLLECTIONS.CATEGORIES, id)
};

// Notifications API
export const notificationsAPI = {
    getByUser: async (userId) => {
        return api.getAll(COLLECTIONS.NOTIFICATIONS, {
            filters: { user_id: userId },
            orderBy: { column: 'created_at', ascending: false },
            limit: 50
        });
    },

    create: (data) => api.create(COLLECTIONS.NOTIFICATIONS, data),
    markAsRead: (id) => api.update(COLLECTIONS.NOTIFICATIONS, id, { read: true }),

    markAllAsRead: async (userId) => {
        try {
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.NOTIFICATIONS, [
                appwriteHelpers.query.equal('user_id', userId),
                appwriteHelpers.query.equal('read', false)
            ]);

            if (!result.success) throw new Error(result.error);

            // Update all notifications
            for (const notification of result.data.documents) {
                await appwriteHelpers.updateDocument(COLLECTIONS.NOTIFICATIONS, notification.id, { read: true });
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export default {
    api,
    productsAPI,
    ordersAPI,
    cartAPI,
    wishlistAPI,
    usersAPI,
    categoriesAPI,
    notificationsAPI
};
