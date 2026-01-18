// Supabase Configuration and Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Tables
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CART: 'cart',
  WISHLIST: 'wishlist',
  DELIVERIES: 'deliveries',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
  NOTIFICATIONS: 'notifications'
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  DELIVERY: 'delivery'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Delivery Status
export const DELIVERY_STATUS = {
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Storage Buckets
export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents'
};

// Helper Functions
export const getStorageUrl = (bucket, path) => {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data;
};

export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

// Real-time Subscriptions
export const subscribeToTable = (table, callback) => {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
};

export const unsubscribe = (subscription) => {
  supabase.removeChannel(subscription);
};

// Error Handler
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Initialize Supabase
export const initSupabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from(TABLES.USERS).select('count').limit(1);
    
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    return false;
  }
};

export default supabase;
