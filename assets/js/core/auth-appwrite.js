// Authentication Module using Appwrite
import { account, appwriteHelpers, COLLECTIONS, ROLES, APPROVAL_STATUS, ID, initializeDatabase } from './appwrite.js';
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

// Get current session
export const getCurrentSession = async () => {
    try {
        const session = await account.get();
        return { success: true, data: session };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get current user profile
export const getCurrentProfile = async () => {
    try {
        const session = await getCurrentSession();
        if (!session.success) {
            return { success: false, error: 'No active session' };
        }

        const result = await appwriteHelpers.listDocuments(COLLECTIONS.USERS, [
            appwriteHelpers.query.equal('user_id', session.data.$id)
        ]);

        if (result.success && result.data.documents.length > 0) {
            return { success: true, data: result.data.documents[0] };
        }

        return { success: false, error: 'Profile not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Initialize authentication state
export const initAuth = async () => {
    try {
        await initializeDatabase();
        const session = await getCurrentSession();
        
        if (session.success) {
            currentUser = session.data;
            
            const profile = await getCurrentProfile();
            if (profile.success) {
                currentProfile = profile.data;
                updateUserUI();
                resetSessionTimeout();
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Auth initialization error:', error);
        return { success: false, error: error.message };
    }
};

// User Sign Up
export const signUp = async (email, password, userData = {}) => {
    try {
        // Validate inputs
        if (!validators.email(email)) {
            return { success: false, error: 'Invalid email address' };
        }
        
        if (!validators.password(password)) {
            return { success: false, error: 'Password must be at least 8 characters with letters and numbers' };
        }

        // Sanitize user data
        const sanitizedData = {
            name: validators.sanitizeInput(userData.name || ''),
            phone: validators.sanitizeInput(userData.phone || ''),
            role: userData.role || ROLES.CUSTOMER,
            ...userData
        };

        // Create user account
        const user = await account.create(
            ID.unique(),
            validators.sanitizeInput(email),
            password,
            sanitizedData.name
        );

        // Create user profile
        const profileData = {
            user_id: user.$id,
            email: validators.sanitizeInput(email),
            name: sanitizedData.name,
            phone: sanitizedData.phone,
            role: sanitizedData.role,
            approval_status: sanitizedData.role === ROLES.CUSTOMER ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const profileResult = await appwriteHelpers.createDocument(COLLECTIONS.USERS, profileData);
        
        if (!profileResult.success) {
            // If profile creation fails, delete the user account
            await account.deleteSession('current');
            return { success: false, error: 'Failed to create user profile' };
        }

        // Create session
        await account.createEmailPasswordSession(email, password);
        
        currentUser = user;
        currentProfile = profileResult.data;

        showToast('Account created successfully!', 'success');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(sanitizedData.role);
        router.navigate(redirectPath);
        
        return { success: true, data: { user, profile: profileResult.data } };
        
    } catch (error) {
        console.error('Sign up error:', error);
        const errorMessage = error.message || 'Failed to create account';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// User Sign In
export const signIn = async (email, password) => {
    try {
        // Validate inputs
        if (!validators.email(email)) {
            return { success: false, error: 'Invalid email address' };
        }

        // Create session
        const session = await account.createEmailPasswordSession(
            validators.sanitizeInput(email),
            password
        );

        // Get user data
        const user = await account.get();
        currentUser = user;

        // Get user profile
        const profile = await getCurrentProfile();
        if (profile.success) {
            currentProfile = profile.data;
            
            // Check approval status
            if (currentProfile.approval_status === APPROVAL_STATUS.PENDING) {
                await account.deleteSession('current');
                return { success: false, error: 'Account is pending approval' };
            }
            
            if (currentProfile.approval_status === APPROVAL_STATUS.REJECTED) {
                await account.deleteSession('current');
                return { success: false, error: 'Account has been rejected' };
            }
        }

        updateUserUI();
        resetSessionTimeout();
        
        showToast('Welcome back!', 'success');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(currentProfile?.role || ROLES.CUSTOMER);
        router.navigate(redirectPath);
        
        return { success: true, data: { user, profile: profile.data } };
        
    } catch (error) {
        console.error('Sign in error:', error);
        const errorMessage = error.message || 'Invalid email or password';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// User Sign Out
export const signOut = async () => {
    try {
        await account.deleteSession('current');
        currentUser = null;
        currentProfile = null;
        
        if (sessionTimer) {
            clearTimeout(sessionTimer);
            sessionTimer = null;
        }
        
        // Clear cart
        cart.clear();
        
        // Update UI
        updateUserUI();
        
        showToast('Signed out successfully', 'success');
        router.navigate('/auth/login.html');
        
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
};

// Password Reset Request
export const requestPasswordReset = async (email) => {
    try {
        if (!validators.email(email)) {
            return { success: false, error: 'Invalid email address' };
        }

        await account.createRecovery(
            validators.sanitizeInput(email),
            `${window.location.origin}/auth/reset-password.html`
        );
        
        showToast('Password reset email sent', 'success');
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        const errorMessage = error.message || 'Failed to send reset email';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Password Reset
export const resetPassword = async (userId, secret, password, confirmPassword) => {
    try {
        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }
        
        if (!validators.password(password)) {
            return { success: false, error: 'Password must be at least 8 characters with letters and numbers' };
        }

        await account.updateRecovery(userId, secret, password, confirmPassword);
        
        showToast('Password reset successfully', 'success');
        router.navigate('/auth/login.html');
        
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        const errorMessage = error.message || 'Failed to reset password';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Update User Profile
export const updateProfile = async (profileData) => {
    try {
        if (!currentProfile) {
            return { success: false, error: 'No user profile found' };
        }

        const sanitizedData = {};
        
        // Sanitize and validate each field
        if (profileData.name) {
            sanitizedData.name = validators.sanitizeInput(profileData.name);
        }
        
        if (profileData.phone) {
            if (!validators.phone(profileData.phone)) {
                return { success: false, error: 'Invalid phone number' };
            }
            sanitizedData.phone = validators.sanitizeInput(profileData.phone);
        }
        
        if (profileData.email) {
            if (!validators.email(profileData.email)) {
                return { success: false, error: 'Invalid email address' };
            }
            
            // Update email in account
            await account.updateEmail(validators.sanitizeInput(profileData.email));
            sanitizedData.email = validators.sanitizeInput(profileData.email);
        }

        sanitizedData.updated_at = new Date().toISOString();

        const result = await appwriteHelpers.updateDocument(
            COLLECTIONS.USERS,
            currentProfile.$id,
            sanitizedData
        );

        if (result.success) {
            currentProfile = { ...currentProfile, ...sanitizedData };
            updateUserUI();
            showToast('Profile updated successfully', 'success');
        }

        return result;
    } catch (error) {
        console.error('Update profile error:', error);
        const errorMessage = error.message || 'Failed to update profile';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Update Password
export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
        if (newPassword !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }
        
        if (!validators.password(newPassword)) {
            return { success: false, error: 'Password must be at least 8 characters with letters and numbers' };
        }

        await account.updatePassword(currentPassword, newPassword, confirmPassword);
        
        showToast('Password updated successfully', 'success');
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        const errorMessage = error.message || 'Failed to update password';
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
    }
};

// Require Authentication
export const requireAuth = async () => {
    try {
        const session = await getCurrentSession();
        if (!session.success) {
            router.navigate('/auth/login.html');
            return false;
        }
        return true;
    } catch (error) {
        router.navigate('/auth/login.html');
        return false;
    }
};

// Require Specific Role
export const requireRole = async (requiredRole) => {
    try {
        const hasAuth = await requireAuth();
        if (!hasAuth) return false;

        if (!currentProfile || currentProfile.role !== requiredRole) {
            showToast('Access denied', 'error');
            router.navigate('/auth/login.html');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Role check error:', error);
        return false;
    }
};

// Get Redirect Path Based on Role
const getRedirectPath = (role) => {
    switch (role) {
        case ROLES.ADMIN:
            return '/admin/dashboard.html';
        case ROLES.DELIVERY:
            return '/delivery/dashboard.html';
        case ROLES.CUSTOMER:
        default:
            return '/customer/dashboard.html';
    }
};

// Update User UI
const updateUserUI = () => {
    // Update user name displays
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(element => {
        element.textContent = currentProfile?.name || 'User';
    });

    // Update user avatar
    const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
    userAvatarElements.forEach(element => {
        if (element.tagName === 'IMG') {
            const name = currentProfile?.name || 'User';
            element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff`;
        }
    });

    // Update user role displays
    const userRoleElements = document.querySelectorAll('[data-user-role]');
    userRoleElements.forEach(element => {
        element.textContent = currentProfile?.role || 'Customer';
    });

    // Show/hide elements based on authentication
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(element => {
        element.style.display = currentUser ? '' : 'none';
    });

    const noAuthElements = document.querySelectorAll('[data-no-auth-required]');
    noAuthElements.forEach(element => {
        element.style.display = currentUser ? 'none' : '';
    });

    // Role-based elements
    const adminElements = document.querySelectorAll('[data-role-admin]');
    adminElements.forEach(element => {
        element.style.display = currentProfile?.role === ROLES.ADMIN ? '' : 'none';
    });

    const deliveryElements = document.querySelectorAll('[data-role-delivery]');
    deliveryElements.forEach(element => {
        element.style.display = currentProfile?.role === ROLES.DELIVERY ? '' : 'none';
    });

    const customerElements = document.querySelectorAll('[data-role-customer]');
    customerElements.forEach(element => {
        element.style.display = currentProfile?.role === ROLES.CUSTOMER ? '' : 'none';
    });
};

// Export current user state
export const getCurrentUser = () => currentUser;
export const getCurrentUserProfile = () => currentProfile;

// Activity tracking
document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('click', resetSessionTimeout);
document.addEventListener('scroll', resetSessionTimeout);
