// Authentication Module
import { account, databases, COLLECTIONS, ROLES, APPROVAL_STATUS, appwriteHelpers, ID } from './appwrite.js';
import { showToast } from '../components/toast.js';
import { router } from './router.js';
import { cart } from '../modules/cart.js';

// Current User State
let currentUser = null;
let currentProfile = null;

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimer = null;

// Input Validation Helpers
const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    password: (password) => {
        // Minimum 8 characters, at least one letter and one number
        return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    },
    
    phone: (phone) => {
        // Basic phone validation (adjust for your region)
        const phoneRegex = /^[+]?[\d\s()-]{9,}$/;
        return phoneRegex.test(phone);
    },
    
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        // Basic XSS prevention
        return input.replace(/[<>]/g, '');
    }
};

// Reset session timeout
const resetSessionTimeout = () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    
    sessionTimer = setTimeout(() => {
        console.warn('Session expired due to inactivity');
        signOut();
        showToast('Session expired. Please sign in again.', 'warning');
    }, SESSION_TIMEOUT);
};

// Get Current User
export const getCurrentUser = () => currentUser;
export const getCurrentProfile = () => currentProfile;

// Check if user is authenticated
export const isAuthenticated = () => {
    return currentUser !== null;
};

// Check user role
export const hasRole = (role) => {
    return currentProfile?.role === role;
};

// Initialize Auth
export const initAuth = async () => {
    try {
        // Get current session
        const session = await account.get();

        currentUser = session;
        await loadUserProfile();

        // Listen for auth changes (Appwrite doesn't have built-in auth state change like Supabase)
        // We'll use a different approach with periodic session checking
        setInterval(async () => {
            try {
                const currentSession = await account.get();
                if (!currentUser || currentSession.$id !== currentUser.$id) {
                    currentUser = currentSession;
                    await loadUserProfile();
                }
            } catch (error) {
                // Session expired
                currentUser = null;
                currentProfile = null;
                router.navigate('../auth/login.html');
            }
        }, 60000); // Check every minute

        return true;
    } catch (error) {
        console.log('No active session found');
        return false;
    }
};

// Load User Profile
const loadUserProfile = async () => {
    try {
        const result = await appwriteHelpers.listDocuments(COLLECTIONS.USERS, [
            appwriteHelpers.query.equal('user_id', currentUser.$id)
        ]);

        if (!result.success || result.data.documents.length === 0) {
            throw new Error('User profile not found');
        }

        const data = result.data.documents[0];
        currentProfile = data;

        // SECURITY: Store minimal data in localStorage
        // Avoid storing sensitive information
        const safeProfile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            approval_status: data.approval_status
        };
        localStorage.setItem('userProfile', JSON.stringify(safeProfile));

        // Reset session timeout on profile load
        resetSessionTimeout();

        return data;
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
};

// Sign Up
export const signUp = async (email, password, userData) => {
    try {
        // Input validation
        if (!validators.email(email)) {
            throw new Error('Invalid email format');
        }
        
        if (!validators.password(password)) {
            throw new Error('Password must be at least 8 characters with letters and numbers');
        }
        
        if (!userData.fullName || userData.fullName.trim().length < 2) {
            throw new Error('Full name is required (minimum 2 characters)');
        }
        
        if (userData.phone && !validators.phone(userData.phone)) {
            throw new Error('Invalid phone number format');
        }

        // Sanitize inputs
        const sanitizedData = {
            fullName: validators.sanitizeInput(userData.fullName.trim()),
            phone: userData.phone ? validators.sanitizeInput(userData.phone.trim()) : null,
            role: userData.role || ROLES.CUSTOMER
        };

        // Validate role
        if (!Object.values(ROLES).includes(sanitizedData.role)) {
            throw new Error('Invalid role specified');
        }

        // Create auth user with Appwrite
        const authData = await account.create(
            ID.unique(),
            email.toLowerCase().trim(),
            password,
            sanitizedData.fullName
        );

        // Create user profile in database
        const profileResult = await appwriteHelpers.createDocument(COLLECTIONS.USERS, {
            user_id: authData.$id,
            email: email.toLowerCase().trim(),
            full_name: sanitizedData.fullName,
            phone: sanitizedData.phone,
            role: sanitizedData.role,
            approval_status: sanitizedData.role === ROLES.CUSTOMER ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING,
            created_at: new Date().toISOString()
        });

        if (!profileResult.success) {
            throw new Error(profileResult.error);
        }

        showToast('Account created successfully! Please check your email for verification.', 'success');

        return { success: true, user: authData };
    } catch (error) {
        console.error('Sign up error:', error);
        const errorMessage = error.message || 'Failed to create account';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Sign In
export const signIn = async (email, password) => {
    try {
        // Input validation
        if (!validators.email(email)) {
            throw new Error('Invalid email format');
        }
        
        if (!password || password.length < 6) {
            throw new Error('Password is required');
        }

        // Create session with Appwrite
        const session = await account.createEmailPasswordSession(
            email.toLowerCase().trim(),
            password
        );

        // Get current user
        currentUser = await account.get();
        await loadUserProfile();
        
        // Start session timeout monitoring
        resetSessionTimeout();

        // Check approval status
        if (currentProfile.approval_status === APPROVAL_STATUS.PENDING) {
            showToast('Your account is pending approval', 'warning');
            router.navigate('../auth/pending-approval.html');
            return { success: true, pending: true };
        }

        if (currentProfile.approval_status === APPROVAL_STATUS.REJECTED) {
            await signOut();
            showToast('Your account has been rejected', 'error');
            return { success: false, rejected: true };
        }

        showToast(`Welcome back, ${currentProfile.full_name}!`, 'success');

        // Final State Check
        const finalUserData = {
            id: currentUser.$id,
            email: currentUser.email,
            role: currentProfile.role,
            full_name: currentProfile.full_name
        };

        localStorage.setItem('user', JSON.stringify(finalUserData));
        localStorage.setItem('userProfile', JSON.stringify(currentProfile));

        handleAuthRedirect();

        return { success: true, user: finalUserData };
    } catch (error) {
        console.error('Sign in error:', error);
        showToast(error.message || 'Failed to sign in', 'error');
        return { success: false, error };
    }
};

// Sign Out
export const signOut = async () => {
    try {
        // Clear session timeout
        if (sessionTimer) {
            clearTimeout(sessionTimer);
            sessionTimer = null;
        }

        // Delete all sessions with Appwrite
        await account.deleteSessions();

        currentUser = null;
        currentProfile = null;
        
        // Clear all sensitive data from storage
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('guestCart'); // Clear guest cart on logout
        sessionStorage.clear(); // Clear any session data

        showToast('Signed out successfully', 'success');
        router.navigate('../auth/login.html');

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('Failed to sign out', 'error');
        return { success: false, error };
    }
};

// Reset Password
export const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password.html`
        });

        if (error) throw error;

        showToast('Password reset email sent! Check your inbox.', 'success');
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(error.message || 'Failed to send reset email', 'error');
        return { success: false, error };
    }
};

// Update Password
export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showToast('Password updated successfully', 'success');
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        showToast(error.message || 'Failed to update password', 'error');
        return { success: false, error };
    }
};

// Update Profile
export const updateProfile = async (updates) => {
    try {
        // Sanitize and validate updates
        const sanitizedUpdates = {};
        
        if (updates.full_name) {
            if (updates.full_name.trim().length < 2) {
                throw new Error('Full name must be at least 2 characters');
            }
            sanitizedUpdates.full_name = validators.sanitizeInput(updates.full_name.trim());
        }
        
        if (updates.phone) {
            if (!validators.phone(updates.phone)) {
                throw new Error('Invalid phone number format');
            }
            sanitizedUpdates.phone = validators.sanitizeInput(updates.phone.trim());
        }
        
        if (updates.email) {
            if (!validators.email(updates.email)) {
                throw new Error('Invalid email format');
            }
            sanitizedUpdates.email = updates.email.toLowerCase().trim();
        }

        // Prevent role/approval_status changes through this method
        delete sanitizedUpdates.role;
        delete sanitizedUpdates.approval_status;
        delete sanitizedUpdates.id;
        delete sanitizedUpdates.created_at;

        if (Object.keys(sanitizedUpdates).length === 0) {
            throw new Error('No valid updates provided');
        }

        const { error } = await supabase
            .from(TABLES.USERS)
            .update(sanitizedUpdates)
            .eq('id', currentUser.id);

        if (error) throw error;

        await loadUserProfile();
        showToast('Profile updated successfully', 'success');

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        const errorMessage = error.message || 'Failed to update profile';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Handle Auth Redirect
const handleAuthRedirect = () => {
    const role = currentProfile?.role;

    switch (role) {
        case ROLES.ADMIN:
            router.navigate('../admin/dashboard.html');
            break;
        case ROLES.DELIVERY:
            router.navigate('../delivery/dashboard.html');
            break;
        case ROLES.CUSTOMER:
        default:
            router.navigate('../customer/dashboard.html');
            break;
    }
};

// Require Auth Middleware
export const requireAuth = async () => {
    if (!isAuthenticated()) {
        router.navigate('../auth/login.html');
        return false;
    }
    return true;
};

// Require Role Middleware
export const requireRole = async (role) => {
    if (!isAuthenticated()) {
        router.navigate('/auth/login.html');
        return false;
    }

    if (!hasRole(role)) {
        router.navigate('../pages/error/403.html');
        return false;
    }

    return true;
};

// Check Approval Status
export const checkApprovalStatus = async () => {
    if (!currentProfile) {
        await loadUserProfile();
    }

    return currentProfile?.approval_status;
};

export default {
    initAuth,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getCurrentUser,
    getCurrentProfile,
    isAuthenticated,
    hasRole,
    requireAuth,
    requireRole,
    checkApprovalStatus
};
