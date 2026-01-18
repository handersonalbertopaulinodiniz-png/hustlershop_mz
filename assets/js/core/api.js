// API Module - Centralized API calls
import { supabase, TABLES, handleSupabaseError } from './supabase.js';

// Generic CRUD Operations
export const api = {
    // Get all records from a table
    getAll: async (table, options = {}) => {
        try {
            let query = supabase.from(table).select(options.select || '*');

            // Apply filters
            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply ordering
            if (options.orderBy) {
                query = query.order(options.orderBy.column, {
                    ascending: options.orderBy.ascending !== false
                });
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Apply range/pagination
            if (options.range) {
                query = query.range(options.range.from, options.range.to);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching from ${table}:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    // Get single record by ID
    getById: async (table, id, select = '*') => {
        try {
            const { data, error } = await supabase
                .from(table)
                .select(select)
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching ${table} by ID:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    // Create new record
    create: async (table, data) => {
        try {
            const { data: result, error } = await supabase
                .from(table)
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: result };
        } catch (error) {
            console.error(`Error creating in ${table}:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    // Update record
    update: async (table, id, data) => {
        try {
            const { data: result, error } = await supabase
                .from(table)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: result };
        } catch (error) {
            console.error(`Error updating ${table}:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    // Delete record
    delete: async (table, id) => {
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`Error deleting from ${table}:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    // Count records
    count: async (table, filters = {}) => {
        try {
            let query = supabase.from(table).select('*', { count: 'exact', head: true });

            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { count, error } = await query;

            if (error) throw error;
            return { success: true, count };
        } catch (error) {
            console.error(`Error counting ${table}:`, error);
            return { success: false, error: handleSupabaseError(error) };
        }
    }
};

// Products API
export const productsAPI = {
    getAll: (options) => api.getAll(TABLES.PRODUCTS, options),
    getById: (id) => api.getById(TABLES.PRODUCTS, id),
    create: (data) => api.create(TABLES.PRODUCTS, data),
    update: (id, data) => api.update(TABLES.PRODUCTS, id, data),
    delete: (id) => api.delete(TABLES.PRODUCTS, id),

    search: async (query) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .limit(20);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    getByCategory: async (categoryId) => {
        return api.getAll(TABLES.PRODUCTS, {
            filters: { category_id: categoryId }
        });
    }
};

// Orders API
export const ordersAPI = {
    getAll: (options) => api.getAll(TABLES.ORDERS, options),
    getById: (id) => api.getById(TABLES.ORDERS, id, '*, order_items(*, products(*))'),
    create: (data) => api.create(TABLES.ORDERS, data),
    update: (id, data) => api.update(TABLES.ORDERS, id, data),
    delete: (id) => api.delete(TABLES.ORDERS, id),

    getByUser: async (userId) => {
        return api.getAll(TABLES.ORDERS, {
            filters: { user_id: userId },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    getByStatus: async (status) => {
        return api.getAll(TABLES.ORDERS, {
            filters: { status },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    // Adiciona um item ao pedido
    addItem: (data) => api.create(TABLES.ORDER_ITEMS, data),

    // Adiciona múltiplos itens de uma vez (Bulk Insert)
    addItems: async (items) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDER_ITEMS)
                .insert(items)
                .select();
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    }
};

// Cart API
export const cartAPI = {
    getByUser: async (userId) => {
        return api.getAll(TABLES.CART, {
            filters: { user_id: userId },
            select: '*, products(*)'
        });
    },

    addItem: async (userId, productId, quantity = 1) => {
        try {
            // Check if item already exists
            const { data: existing } = await supabase
                .from(TABLES.CART)
                .select('*')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .single();

            if (existing) {
                // Update quantity
                return api.update(TABLES.CART, existing.id, {
                    quantity: existing.quantity + quantity
                });
            } else {
                // Create new item
                return api.create(TABLES.CART, {
                    user_id: userId,
                    product_id: productId,
                    quantity
                });
            }
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    updateQuantity: (id, quantity) => api.update(TABLES.CART, id, { quantity }),
    removeItem: (id) => api.delete(TABLES.CART, id),

    clearCart: async (userId) => {
        try {
            const { error } = await supabase
                .from(TABLES.CART)
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    }
};

// Wishlist API
export const wishlistAPI = {
    getByUser: async (userId) => {
        return api.getAll(TABLES.WISHLIST, {
            filters: { user_id: userId },
            select: '*, products(*)'
        });
    },

    addItem: (userId, productId) => api.create(TABLES.WISHLIST, {
        user_id: userId,
        product_id: productId
    }),

    removeItem: async (userId, productId) => {
        try {
            const { error } = await supabase
                .from(TABLES.WISHLIST)
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    },

    isInWishlist: async (userId, productId) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.WISHLIST)
                .select('id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .single();

            return { success: true, exists: !!data };
        } catch (error) {
            return { success: true, exists: false };
        }
    }
};

// Deliveries API
export const deliveriesAPI = {
    getAll: (options) => api.getAll(TABLES.DELIVERIES, options),
    getById: (id) => api.getById(TABLES.DELIVERIES, id, '*, orders(*)'),
    create: (data) => api.create(TABLES.DELIVERIES, data),
    update: (id, data) => api.update(TABLES.DELIVERIES, id, data),

    getByDeliveryPerson: async (userId) => {
        return api.getAll(TABLES.DELIVERIES, {
            filters: { delivery_person_id: userId },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    getActiveDeliveries: async (userId) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.DELIVERIES)
                .select('*, orders(*)')
                .eq('delivery_person_id', userId)
                .in('status', ['assigned', 'picked_up', 'in_transit']);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    }
};

// Users API
export const usersAPI = {
    getAll: (options) => api.getAll(TABLES.USERS, options),
    getById: (id) => api.getById(TABLES.USERS, id),
    update: (id, data) => api.update(TABLES.USERS, id, data),
    delete: (id) => api.delete(TABLES.USERS, id),

    getPendingApprovals: async () => {
        return api.getAll(TABLES.USERS, {
            filters: { approval_status: 'pending' },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    approveUser: (id) => api.update(TABLES.USERS, id, {
        approval_status: 'approved'
    }),

    rejectUser: (id) => api.update(TABLES.USERS, id, {
        approval_status: 'rejected'
    })
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.getAll(TABLES.CATEGORIES),
    getById: (id) => api.getById(TABLES.CATEGORIES, id),
    create: (data) => api.create(TABLES.CATEGORIES, data),
    update: (id, data) => api.update(TABLES.CATEGORIES, id, data),
    delete: (id) => api.delete(TABLES.CATEGORIES, id)
};

// Notifications API
export const notificationsAPI = {
    getByUser: async (userId) => {
        return api.getAll(TABLES.NOTIFICATIONS, {
            filters: { user_id: userId },
            orderBy: { column: 'created_at', ascending: false },
            limit: 50
        });
    },

    create: (data) => api.create(TABLES.NOTIFICATIONS, data),
    markAsRead: (id) => api.update(TABLES.NOTIFICATIONS, id, { read: true }),

    markAllAsRead: async (userId) => {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: handleSupabaseError(error) };
        }
    }
};

export default {
    api,
    productsAPI,
    ordersAPI,
    cartAPI,
    wishlistAPI,
    deliveriesAPI,
    usersAPI,
    categoriesAPI,
    notificationsAPI
};
