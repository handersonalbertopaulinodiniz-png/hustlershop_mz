// API Module using Appwrite
import { appwriteHelpers, COLLECTIONS, ORDER_STATUS, DELIVERY_STATUS, PAYMENT_STATUS } from './appwrite.js';
import { getCurrentUser, getCurrentUserProfile } from './auth-appwrite.js';

const buildQueries = (options = {}) => {
    const queries = [];

    if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
            queries.push(appwriteHelpers.query.equal(key, value));
        });
    }

    if (options.orderBy) {
        const { column, ascending = true } = options.orderBy;
        queries.push(ascending ? appwriteHelpers.query.orderAsc(column) : appwriteHelpers.query.orderDesc(column));
    }

    if (options.limit) {
        queries.push(appwriteHelpers.query.limit(options.limit));
    }

    if (options.offset) {
        queries.push(appwriteHelpers.query.offset(options.offset));
    }

    return queries;
};

export const api = {
    getAll: async (collectionId, options = {}) => {
        try {
            const queries = buildQueries(options);
            const result = await appwriteHelpers.listDocuments(collectionId, queries);

            if (result.success) {
                return { success: true, data: result.data.documents };
            }

            return result;
        } catch (error) {
            console.error(`Error fetching from ${collectionId}:`, error);
            return { success: false, error: error.message };
        }
    },

    count: async (collectionId, filters = {}) => {
        try {
            const queries = buildQueries({ filters, limit: 1 });
            const result = await appwriteHelpers.listDocuments(collectionId, queries);

            if (result.success) {
                return { success: true, count: result.data.total };
            }

            return result;
        } catch (error) {
            console.error(`Error counting ${collectionId}:`, error);
            return { success: false, error: error.message };
        }
    }
};

// Deliveries API
export const deliveriesAPI = {
    getAll: async (options = {}) => api.getAll(COLLECTIONS.DELIVERIES, options),

    getById: async (deliveryId) => {
        return await appwriteHelpers.getDocument(COLLECTIONS.DELIVERIES, deliveryId);
    },

    create: async (deliveryData) => {
        const data = {
            ...deliveryData,
            status: deliveryData.status || DELIVERY_STATUS.ASSIGNED,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return await appwriteHelpers.createDocument(COLLECTIONS.DELIVERIES, data);
    },

    update: async (deliveryId, data) => {
        return await appwriteHelpers.updateDocument(COLLECTIONS.DELIVERIES, deliveryId, {
            ...data,
            updated_at: new Date().toISOString()
        });
    },

    getByDeliveryPerson: async (userId) => {
        return await api.getAll(COLLECTIONS.DELIVERIES, {
            filters: { delivery_person_id: userId },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    getActiveDeliveries: async (userId) => {
        const queries = [
            appwriteHelpers.query.equal('delivery_person_id', userId),
            appwriteHelpers.query.orderDesc('created_at')
        ];
        const result = await appwriteHelpers.listDocuments(COLLECTIONS.DELIVERIES, queries);
        if (!result.success) return result;

        const activeStatuses = [DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.IN_TRANSIT];
        return {
            success: true,
            data: result.data.documents.filter(delivery => activeStatuses.includes(delivery.status))
        };
    }
};

// Users API
export const usersAPI = {
    getAll: async (options = {}) => api.getAll(COLLECTIONS.USERS, options),

    getById: async (userId) => {
        return await appwriteHelpers.getDocument(COLLECTIONS.USERS, userId);
    },

    update: async (userId, data) => {
        return await appwriteHelpers.updateDocument(COLLECTIONS.USERS, userId, {
            ...data,
            updated_at: new Date().toISOString()
        });
    },

    delete: async (userId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.USERS, userId);
    },

    getPendingApprovals: async () => {
        return await api.getAll(COLLECTIONS.USERS, {
            filters: { approval_status: 'pending' },
            orderBy: { column: 'created_at', ascending: false }
        });
    },

    approveUser: async (userId) => {
        return await usersAPI.update(userId, { approval_status: 'approved' });
    },

    rejectUser: async (userId) => {
        return await usersAPI.update(userId, { approval_status: 'rejected' });
    }
};

// Products API
export const productsAPI = {
    // Get all products
    getAll: async (filters = {}) => {
        try {
            const queries = [];
            
            if (filters.category) {
                queries.push(appwriteHelpers.query.equal('category', filters.category));
            }
            
            if (filters.minPrice) {
                queries.push(appwriteHelpers.query.greaterThanEqual('price', filters.minPrice));
            }
            
            if (filters.maxPrice) {
                queries.push(appwriteHelpers.query.lessThanEqual('price', filters.maxPrice));
            }
            
            if (filters.search) {
                queries.push(appwriteHelpers.query.search('name', filters.search));
            }
            
            if (filters.inStock) {
                queries.push(appwriteHelpers.query.greaterThan('stock', 0));
            }
            
            queries.push(appwriteHelpers.query.orderDesc('created_at'));
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.PRODUCTS, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get products error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get product by ID
    getById: async (productId) => {
        return await appwriteHelpers.getDocument(COLLECTIONS.PRODUCTS, productId);
    },

    // Create product (admin only)
    create: async (productData) => {
        try {
            const data = {
                ...productData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: getCurrentUser()?.$id
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.PRODUCTS, data);
        } catch (error) {
            console.error('Create product error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update product (admin only)
    update: async (productId, productData) => {
        try {
            const data = {
                ...productData,
                updated_at: new Date().toISOString(),
                updated_by: getCurrentUser()?.$id
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.PRODUCTS, productId, data);
        } catch (error) {
            console.error('Update product error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete product (admin only)
    delete: async (productId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.PRODUCTS, productId);
    }
};

// Orders API
export const ordersAPI = {
    getAll: async (options = {}) => api.getAll(COLLECTIONS.ORDERS, options),
    // Get user orders
    getUserOrders: async (userId = null) => {
        try {
            const profile = getCurrentUserProfile();
            const targetUserId = userId || profile?.user_id;
            
            if (!targetUserId) {
                return { success: false, error: 'User not found' };
            }
            
            const queries = [
                appwriteHelpers.query.equal('user_id', targetUserId),
                appwriteHelpers.query.orderDesc('created_at')
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.ORDERS, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get user orders error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get order by ID
    getById: async (orderId) => {
        return await appwriteHelpers.getDocument(COLLECTIONS.ORDERS, orderId);
    },

    // Create order
    create: async (orderData) => {
        try {
            const profile = getCurrentUserProfile();
            
            const data = {
                ...orderData,
                user_id: profile?.user_id,
                status: ORDER_STATUS.PENDING,
                payment_status: PAYMENT_STATUS.PENDING,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.ORDERS, data);
        } catch (error) {
            console.error('Create order error:', error);
            return { success: false, error: error.message };
        }
    },

    update: async (orderId, data) => {
        return await appwriteHelpers.updateDocument(COLLECTIONS.ORDERS, orderId, {
            ...data,
            updated_at: new Date().toISOString()
        });
    },

    delete: async (orderId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.ORDERS, orderId);
    },

    addItem: async (itemData) => {
        return await appwriteHelpers.createDocument(COLLECTIONS.ORDER_ITEMS, {
            ...itemData,
            created_at: new Date().toISOString()
        });
    },

    addItems: async (items) => {
        try {
            const results = await Promise.all(items.map(item => ordersAPI.addItem(item)));
            const failures = results.filter(result => !result.success);
            if (failures.length) {
                return { success: false, error: failures[0].error };
            }
            return { success: true, data: results.map(result => result.data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update order status
    updateStatus: async (orderId, status) => {
        try {
            const data = {
                status,
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.ORDERS, orderId, data);
        } catch (error) {
            console.error('Update order status error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update payment status
    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            const data = {
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.ORDERS, orderId, data);
        } catch (error) {
            console.error('Update payment status error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get delivery orders (for delivery personnel)
    getDeliveryOrders: async () => {
        try {
            const queries = [
                appwriteHelpers.query.equal('status', ORDER_STATUS.DELIVERING),
                appwriteHelpers.query.orderDesc('created_at')
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.ORDERS, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get delivery orders error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Cart API
export const cartAPI = {
    // Get user cart
    getUserCart: async () => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const queries = [
                appwriteHelpers.query.equal('user_id', profile.user_id)
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.CART, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get user cart error:', error);
            return { success: false, error: error.message };
        }
    },

    // Add item to cart
    addItem: async (productId, quantity = 1) => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            // Check if item already exists in cart
            const existingItems = await cartAPI.getUserCart();
            if (existingItems.success) {
                const existingItem = existingItems.data.find(item => item.product_id === productId);
                
                if (existingItem) {
                    // Update quantity
                    const newQuantity = existingItem.quantity + quantity;
                    return await cartAPI.updateItem(existingItem.$id, newQuantity);
                }
            }
            
            const data = {
                user_id: profile.user_id,
                product_id: productId,
                quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.CART, data);
        } catch (error) {
            console.error('Add cart item error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update cart item quantity
    updateItem: async (cartItemId, quantity) => {
        try {
            const data = {
                quantity,
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.CART, cartItemId, data);
        } catch (error) {
            console.error('Update cart item error:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove item from cart
    removeItem: async (cartItemId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.CART, cartItemId);
    },

    // Clear user cart
    clearUserCart: async () => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const cartItems = await cartAPI.getUserCart();
            if (cartItems.success) {
                const deletePromises = cartItems.data.map(item => 
                    appwriteHelpers.deleteDocument(COLLECTIONS.CART, item.$id)
                );
                
                await Promise.all(deletePromises);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Clear cart error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Wishlist API
export const wishlistAPI = {
    // Get user wishlist
    getUserWishlist: async () => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const queries = [
                appwriteHelpers.query.equal('user_id', profile.user_id)
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.WISHLIST, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get user wishlist error:', error);
            return { success: false, error: error.message };
        }
    },

    // Add item to wishlist
    addItem: async (productId) => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const data = {
                user_id: profile.user_id,
                product_id: productId,
                created_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.WISHLIST, data);
        } catch (error) {
            console.error('Add wishlist item error:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove item from wishlist
    removeItem: async (wishlistItemId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.WISHLIST, wishlistItemId);
    },

    // Check if product is in wishlist
    isInWishlist: async (productId) => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const queries = [
                appwriteHelpers.query.equal('user_id', profile.user_id),
                appwriteHelpers.query.equal('product_id', productId)
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.WISHLIST, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents.length > 0
                };
            }
            
            return result;
        } catch (error) {
            console.error('Check wishlist error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Categories API
export const categoriesAPI = {
    // Get all categories
    getAll: async () => {
        try {
            const queries = [
                appwriteHelpers.query.orderAsc('name')
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.CATEGORIES, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get categories error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get category by ID
    getById: async (categoryId) => {
        return await appwriteHelpers.getDocument(COLLECTIONS.CATEGORIES, categoryId);
    },

    // Create category (admin only)
    create: async (categoryData) => {
        try {
            const data = {
                ...categoryData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: getCurrentUser()?.$id
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.CATEGORIES, data);
        } catch (error) {
            console.error('Create category error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update category (admin only)
    update: async (categoryId, categoryData) => {
        try {
            const data = {
                ...categoryData,
                updated_at: new Date().toISOString(),
                updated_by: getCurrentUser()?.$id
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.CATEGORIES, categoryId, data);
        } catch (error) {
            console.error('Update category error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete category (admin only)
    delete: async (categoryId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.CATEGORIES, categoryId);
    }
};

// Reviews API
export const reviewsAPI = {
    // Get product reviews
    getProductReviews: async (productId) => {
        try {
            const queries = [
                appwriteHelpers.query.equal('product_id', productId),
                appwriteHelpers.query.orderDesc('created_at')
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.REVIEWS, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get product reviews error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create review
    create: async (reviewData) => {
        try {
            const profile = getCurrentUserProfile();
            
            const data = {
                ...reviewData,
                user_id: profile?.user_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.REVIEWS, data);
        } catch (error) {
            console.error('Create review error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update review
    update: async (reviewId, reviewData) => {
        try {
            const data = {
                ...reviewData,
                updated_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.REVIEWS, reviewId, data);
        } catch (error) {
            console.error('Update review error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete review
    delete: async (reviewId) => {
        return await appwriteHelpers.deleteDocument(COLLECTIONS.REVIEWS, reviewId);
    }
};

// Notifications API
export const notificationsAPI = {
    // Get user notifications
    getUserNotifications: async () => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const queries = [
                appwriteHelpers.query.equal('user_id', profile.user_id),
                appwriteHelpers.query.orderDesc('created_at')
            ];
            
            const result = await appwriteHelpers.listDocuments(COLLECTIONS.NOTIFICATIONS, queries);
            
            if (result.success) {
                return {
                    success: true,
                    data: result.data.documents
                };
            }
            
            return result;
        } catch (error) {
            console.error('Get user notifications error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create notification
    create: async (notificationData) => {
        try {
            const data = {
                ...notificationData,
                created_at: new Date().toISOString(),
                read: false
            };
            
            return await appwriteHelpers.createDocument(COLLECTIONS.NOTIFICATIONS, data);
        } catch (error) {
            console.error('Create notification error:', error);
            return { success: false, error: error.message };
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const data = {
                read: true,
                read_at: new Date().toISOString()
            };
            
            return await appwriteHelpers.updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, data);
        } catch (error) {
            console.error('Mark notification as read error:', error);
            return { success: false, error: error.message };
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const profile = getCurrentUserProfile();
            
            if (!profile?.user_id) {
                return { success: false, error: 'User not found' };
            }
            
            const notifications = await notificationsAPI.getUserNotifications();
            if (notifications.success) {
                const unreadNotifications = notifications.data.filter(n => !n.read);
                
                const updatePromises = unreadNotifications.map(notification => 
                    notificationsAPI.markAsRead(notification.$id)
                );
                
                await Promise.all(updatePromises);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export all APIs
export default {
    products: productsAPI,
    orders: ordersAPI,
    cart: cartAPI,
    wishlist: wishlistAPI,
    categories: categoriesAPI,
    reviews: reviewsAPI,
    notifications: notificationsAPI
};
