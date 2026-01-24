// Appwrite Configuration and Client
import { Client, Account, Databases, ID, Query } from 'https://cdn.jsdelivr.net/npm/appwrite@21.2.1/+esm';

// Appwrite Configuration - Update these with your actual values
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '696e35180026caf34a47';
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'hustlershop-db'; // Will be created if doesn't exist

// Validate configuration
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  console.error('CRITICAL: Appwrite configuration missing!');
  throw new Error('Appwrite configuration is required');
}

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);

// Ping Appwrite to verify connection
client.ping().then(response => {
  console.log('✅ Appwrite connection successful:', response);
}).catch(error => {
  console.error('❌ Appwrite connection failed:', error);
});

// Attach to window for easy debugging in the browser console
window.__APPWRITE_CLIENT__ = client;
window.__APPWRITE_ACCOUNT__ = account;
window.__APPWRITE_DATABASES__ = databases;

// Database Collections (equivalent to Supabase tables)
export const COLLECTIONS = {
  USERS: 'profiles',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  DELIVERIES: 'deliveries',
  CART: 'cart',
  WISHLIST: 'wishlist',
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
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Delivery Status
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
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
  PROFILES: 'profiles',
  ORDERS: 'orders'
};

// Helper Functions for Appwrite
const normalizeDocument = (document) => {
  if (!document) return document;
  return {
    ...document,
    id: document.$id
  };
};

const normalizeDocumentList = (documents = []) => documents.map(normalizeDocument);

export const appwriteHelpers = {
  // Get storage URL
  getStorageUrl: (bucketId, fileId) => {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
  },

  // Upload file
  uploadFile: async (bucketId, file, permissions = []) => {
    try {
      const result = await account.createFile(
        bucketId,
        ID.unique(),
        file,
        permissions
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create document with automatic ID
  createDocument: async (collectionId, data, permissions = []) => {
    try {
      const result = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        ID.unique(),
        data,
        permissions
      );
      return { success: true, data: normalizeDocument(result) };
    } catch (error) {
      console.error('Create document error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get document by ID
  getDocument: async (collectionId, documentId) => {
    try {
      const result = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        documentId
      );
      return { success: true, data: normalizeDocument(result) };
    } catch (error) {
      console.error('Get document error:', error);
      return { success: false, error: error.message };
    }
  },

  // List documents with queries
  listDocuments: async (collectionId, queries = []) => {
    try {
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        collectionId,
        queries
      );
      return {
        success: true,
        data: {
          ...result,
          documents: normalizeDocumentList(result.documents)
        }
      };
    } catch (error) {
      console.error('List documents error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update document
  updateDocument: async (collectionId, documentId, data, permissions = []) => {
    try {
      const result = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      );
      return { success: true, data: normalizeDocument(result) };
    } catch (error) {
      console.error('Update document error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete document
  deleteDocument: async (collectionId, documentId) => {
    try {
      const result = await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        documentId
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, error: error.message };
    }
  },

  // Query helpers
  query: {
    equal: (attribute, value) => Query.equal(attribute, value),
    notEqual: (attribute, value) => Query.notEqual(attribute, value),
    lessThan: (attribute, value) => Query.lessThan(attribute, value),
    lessThanEqual: (attribute, value) => Query.lessThanEqual(attribute, value),
    greaterThan: (attribute, value) => Query.greaterThan(attribute, value),
    greaterThanEqual: (attribute, value) => Query.greaterThanEqual(attribute, value),
    search: (attribute, value) => Query.search(attribute, value),
    orderDesc: (attribute) => Query.orderDesc(attribute),
    orderAsc: (attribute) => Query.orderAsc(attribute),
    limit: (limit) => Query.limit(limit),
    offset: (offset) => Query.offset(offset),
    cursorAfter: (documentId) => Query.cursorAfter(documentId),
    cursorBefore: (documentId) => Query.cursorBefore(documentId)
  }
};

// Initialize database and collections if they don't exist
export const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    try {
      await databases.get(APPWRITE_DATABASE_ID);
      console.log('✅ Database already exists:', APPWRITE_DATABASE_ID);
    } catch (error) {
      if (error.code === 404) {
        await databases.create(APPWRITE_DATABASE_ID, 'HustlerShop Database');
        console.log('✅ Created database:', APPWRITE_DATABASE_ID);
      }
    }

    // Create collections if they don't exist
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        await databases.getCollection(APPWRITE_DATABASE_ID, collectionName);
        console.log(`✅ Collection already exists: ${collectionName}`);
      } catch (error) {
        if (error.code === 404) {
          await databases.createCollection(
            APPWRITE_DATABASE_ID,
            collectionName,
            collectionName.charAt(0).toUpperCase() + collectionName.slice(1)
          );
          console.log(`✅ Created collection: ${collectionName}`);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error: error.message };
  }
};

// Export Appwrite services
export { client, account, databases, ID };

// Export configuration
export const config = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID
};

// Only log in development
if (import.meta.env?.MODE === 'development') {
  console.log('Initializing Appwrite for project:', APPWRITE_PROJECT_ID);
  console.log('Database ID:', APPWRITE_DATABASE_ID);
}
